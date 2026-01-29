/**
 * CSV Import Workflow
 *
 * Durable workflow for processing CSV uploads using Vercel Workflow DevKit.
 * Handles creating application records and processing OCR for each row.
 */

import { getWritable } from "workflow";
import prisma from "@/lib/prisma";
import type { CsvRow, ProgressUpdate } from "@/lib/csv/types";
import { extractApplicationData, parseImageUrls } from "@/lib/csv/parser";
import { processApplicationImages } from "@/lib/ocr/process";
import { compareApplication } from "@/lib/comparison/compare";
import type { ApplicationData, ExtractedFields } from "@/lib/comparison/types";

/**
 * Send a progress update to connected clients
 */
async function sendProgress(update: ProgressUpdate) {
  "use step";

  const writable = getWritable<ProgressUpdate>();
  const writer = writable.getWriter();
  await writer.write(update);
  writer.releaseLock();
}

/**
 * Create an Application record and associated LabelImage records from a CSV row
 */
async function createApplicationFromRow(
  row: CsvRow,
  index: number,
  total: number
): Promise<string | null> {
  "use step";

  const data = extractApplicationData(row);

  // Check if this COLA ID already exists
  const existing = await prisma.application.findFirst({
    where: { colaId: data.colaId },
  });

  if (existing) {
    await sendProgress({
      applicationId: existing.id,
      brandName: data.brandName,
      status: "SKIPPED",
      index,
      total,
    });
    return null;
  }

  // Create the application record
  const application = await prisma.application.create({
    data: {
      colaId: data.colaId,
      brandName: data.brandName,
      classType: data.classType || null,
      productType: data.productType || null,
      sourceType: data.sourceType || null,
      alcoholContent: data.alcoholContent || null,
      netContents: data.netContents || null,
      governmentWarning: null, // Will be populated from OCR
      bottlerName: data.applicantName || null,
      bottlerAddress: data.applicantAddress || null,
      countryOfOrigin: data.countryOfOrigin || null,
      permitNumber: data.permitNumber || null,
      serialNumber: data.serialNumber || null,
      status: "PENDING",
    },
  });

  // Create LabelImage records for each image URL
  for (const img of data.images) {
    await prisma.labelImage.create({
      data: {
        applicationId: application.id,
        blobUrl: img.url,
        imageType: img.type.toUpperCase(),
      },
    });
  }

  // Send progress update
  await sendProgress({
    applicationId: application.id,
    brandName: data.brandName,
    status: "QUEUED",
    index,
    total,
  });

  return application.id;
}

/**
 * Process a single application: run OCR and comparison
 */
async function processApplication(
  applicationId: string,
  index: number,
  total: number
): Promise<void> {
  "use step";

  // Get application data for progress updates
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { brandName: true },
  });

  const brandName = application?.brandName || "Unknown";

  try {
    // Update status to PROCESSING
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "PROCESSING" },
    });

    // Send processing status
    await sendProgress({
      applicationId,
      brandName,
      status: "PROCESSING",
      index,
      total,
    });

    // Run OCR on all images
    const ocrResult = await processApplicationImages(applicationId);

    // If OCR failed completely, mark as error and return
    if (ocrResult.successCount === 0 && ocrResult.errorCount > 0) {
      await sendProgress({
        applicationId,
        brandName,
        status: "ERROR",
        index,
        total,
        error: "OCR processing failed for all images",
      });
      return;
    }

    // Get application data for comparison
    const appData = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!appData || !ocrResult.mergedFields) {
      await sendProgress({
        applicationId,
        brandName,
        status: "ERROR",
        index,
        total,
        error: "Missing application data or OCR results",
      });
      return;
    }

    // Convert to comparison format
    const applicationData: ApplicationData = {
      id: appData.id,
      productType: appData.productType || null,
      sourceType: appData.sourceType || null,
      brandName: appData.brandName,
      classType: appData.classType || null,
      alcoholContent: appData.alcoholContent || null,
      netContents: appData.netContents || null,
      governmentWarning: appData.governmentWarning || null,
      bottlerName: appData.bottlerName || null,
      bottlerAddress: appData.bottlerAddress || null,
      countryOfOrigin: appData.countryOfOrigin || null,
    };

    const extractedFields: ExtractedFields = {
      brandName: ocrResult.mergedFields.brandName,
      classType: ocrResult.mergedFields.classType,
      alcoholContent: ocrResult.mergedFields.alcoholContent,
      netContents: ocrResult.mergedFields.netContents,
      governmentWarning: ocrResult.mergedFields.governmentWarning,
      bottlerName: ocrResult.mergedFields.bottlerName,
      bottlerAddress: ocrResult.mergedFields.bottlerAddress,
      countryOfOrigin: ocrResult.mergedFields.countryOfOrigin,
      confidenceScores: ocrResult.mergedFields.confidenceScores,
    };

    // Run comparison
    const comparisonResult = compareApplication(applicationData, extractedFields);

    // Store comparison result
    await prisma.comparison.create({
      data: {
        applicationId,
        mergedFields: JSON.stringify(extractedFields),
        matchResults: JSON.stringify(comparisonResult.fields),
        overallStatus: comparisonResult.overallStatus,
        mismatchCount: comparisonResult.mismatchCount,
        computedAt: new Date(),
      },
    });

    // Determine final status based on comparison
    let finalStatus: "READY" | "NEEDS_ATTENTION" | "ERROR";
    if (comparisonResult.overallStatus === "MATCH") {
      finalStatus = "READY";
    } else if (
      comparisonResult.overallStatus === "MISMATCH" ||
      comparisonResult.overallStatus === "NEEDS_REVIEW"
    ) {
      finalStatus = "NEEDS_ATTENTION";
    } else {
      finalStatus = "NEEDS_ATTENTION";
    }

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: finalStatus },
    });

    // Send final status
    await sendProgress({
      applicationId,
      brandName,
      status: finalStatus,
      index,
      total,
    });
  } catch (error) {
    // Mark as error on failure
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "ERROR" },
    });

    await sendProgress({
      applicationId,
      brandName,
      status: "ERROR",
      index,
      total,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Close the progress stream
 */
async function closeStream() {
  "use step";

  const writable = getWritable<ProgressUpdate>();
  await writable.close();
}

/**
 * Main CSV import workflow
 *
 * @param rows - Parsed and validated CSV rows
 */
export async function csvImportWorkflow(rows: CsvRow[]) {
  "use workflow";

  const total = rows.length;
  const applicationIds: (string | null)[] = [];

  // Phase 1: Create all application records (skips duplicates)
  for (let i = 0; i < rows.length; i++) {
    const applicationId = await createApplicationFromRow(rows[i], i + 1, total);
    applicationIds.push(applicationId);
  }

  // Phase 2: Process each application (OCR + comparison), skip nulls (duplicates)
  for (let i = 0; i < applicationIds.length; i++) {
    const id = applicationIds[i];
    if (id) {
      await processApplication(id, i + 1, total);
    }
  }

  // Close the stream
  await closeStream();
}
