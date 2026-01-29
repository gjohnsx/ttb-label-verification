import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import type { CsvRow } from "@/lib/csv/types";
import { extractApplicationData } from "@/lib/csv/parser";
import { processApplicationImages } from "@/lib/ocr/process";
import { compareApplication } from "@/lib/comparison/compare";
import type { ApplicationData, ExtractedFields } from "@/lib/comparison/types";

type CreateRunResult = {
  createdCount: number;
  skippedCount: number;
  applicationIds: string[];
};

export async function createApplicationsForRun(
  rows: CsvRow[],
  runId: string
): Promise<CreateRunResult> {
  const applicationIds: string[] = [];
  let createdCount = 0;
  let skippedCount = 0;

  const colaIds = Array.from(
    new Set(
      rows
        .map((row) => (row.TTB_ID || "").trim())
        .filter((value) => value.length > 0)
    )
  );

  const existingApplications = colaIds.length
    ? await prisma.application.findMany({
        where: { colaId: { in: colaIds } },
        select: { id: true, colaId: true },
      })
    : [];

  const existingByColaId = new Map<string, string>();
  const duplicateIds: string[] = [];

  existingApplications.forEach((app) => {
    if (app.colaId) {
      existingByColaId.set(app.colaId, app.id);
    }
  });

  const newApplications: Array<{
    id: string;
    data: ReturnType<typeof extractApplicationData>;
  }> = [];
  const newImages: Array<{
    applicationId: string;
    blobUrl: string;
    imageType: string;
  }> = [];

  for (const row of rows) {
    const data = extractApplicationData(row);
    const colaId = data.colaId?.trim();

    if (colaId && existingByColaId.has(colaId)) {
      duplicateIds.push(existingByColaId.get(colaId)!);
      skippedCount++;
      continue;
    }

    const applicationId = randomUUID();
    newApplications.push({ id: applicationId, data });
    applicationIds.push(applicationId);
    createdCount++;

    data.images.forEach((image) => {
      newImages.push({
        applicationId,
        blobUrl: image.url,
        imageType: image.type.toUpperCase(),
      });
    });
  }

  if (duplicateIds.length > 0) {
    await prisma.application.updateMany({
      where: { id: { in: duplicateIds } },
      data: { uploadRunId: runId, uploadRunStatus: "SKIPPED" },
    });
  }

  const chunk = <T,>(items: T[], size: number) => {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      batches.push(items.slice(i, i + size));
    }
    return batches;
  };

  if (newApplications.length > 0) {
    for (const batch of chunk(newApplications, 100)) {
      await prisma.application.createMany({
        data: batch.map(({ id, data }) => ({
          id,
          colaId: data.colaId,
          brandName: data.brandName,
          classType: data.classType || null,
          productType: data.productType || null,
          sourceType: data.sourceType || null,
          alcoholContent: data.alcoholContent || null,
          netContents: data.netContents || null,
          governmentWarning: null,
          bottlerName: data.applicantName || null,
          bottlerAddress: data.applicantAddress || null,
          countryOfOrigin: data.countryOfOrigin || null,
          permitNumber: data.permitNumber || null,
          serialNumber: data.serialNumber || null,
          uploadRunId: runId,
          uploadRunStatus: null,
          status: "PENDING",
        })),
      });
    }
  }

  if (newImages.length > 0) {
    for (const batch of chunk(newImages, 200)) {
      await prisma.labelImage.createMany({ data: batch });
    }
  }

  return { createdCount, skippedCount, applicationIds };
}

async function processApplicationWithComparison(
  applicationId: string
): Promise<void> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error(`Application not found: ${applicationId}`);
  }

  const ocrResult = await processApplicationImages(applicationId);

  if (ocrResult.successCount === 0 && ocrResult.errorCount > 0) {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "ERROR" },
    });
    return;
  }

  const appData = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!appData || !ocrResult.mergedFields) {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "ERROR" },
    });
    return;
  }

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

  const comparisonResult = compareApplication(applicationData, extractedFields);

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

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: finalStatus },
  });
}

export async function processNextApplication(runId: string): Promise<{
  processedCount: number;
  applicationId?: string;
}> {
  const next = await prisma.application.findFirst({
    where: { uploadRunId: runId, status: "PENDING", uploadRunStatus: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!next) {
    return { processedCount: 0 };
  }

  try {
    const updateResult = await prisma.application.updateMany({
      where: { id: next.id, status: "PENDING" },
      data: { status: "PROCESSING" },
    });

    if (updateResult.count === 0) {
      return { processedCount: 0 };
    }

    await processApplicationWithComparison(next.id);
    return { processedCount: 1, applicationId: next.id };
  } catch (error) {
    await prisma.application.update({
      where: { id: next.id },
      data: { status: "ERROR" },
    });
    return { processedCount: 1, applicationId: next.id };
  }
}
