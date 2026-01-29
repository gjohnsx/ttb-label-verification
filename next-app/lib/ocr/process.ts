/**
 * Application OCR processing functions
 *
 * Orchestrates two-step extraction:
 * 1. Mistral OCR → raw markdown text
 * 2. Azure OpenAI → structured fields + confidence scores
 */

import prisma from "@/lib/prisma";
import type { ExtractedFields, FieldType } from "@/lib/comparison/types";
import { extractRawText, isOcrConfigured } from "./mistral";
import {
  extractFieldsFromMarkdown,
  isFieldExtractionConfigured,
} from "./extract-fields";

/**
 * Raw OCR result for a single image
 */
interface ImageOcrResult {
  imageId: string;
  imageType: string;
  rawMarkdown: string;
  processingTimeMs: number;
  modelVersion: string;
}


/**
 * Result of processing all images for an application
 */
export interface ApplicationOcrResult {
  applicationId: string;
  imagesProcessed: number;
  successCount: number;
  errorCount: number;
  totalProcessingTimeMs: number;
  results: Array<{
    imageId: string;
    imageType: string;
    success: boolean;
    error?: string;
    extractedFields?: ExtractedFields;
    processingTimeMs: number;
  }>;
  mergedFields?: ExtractedFields;
  newStatus: string;
}


function determineApplicationStatus(
  successCount: number,
  errorCount: number,
  mergedFields: ExtractedFields | undefined
): string {
  if (successCount === 0 && errorCount > 0) {
    return "ERROR";
  }

  if (mergedFields) {
    const hasBrandName = !!mergedFields.brandName;
    const hasAlcoholContent = !!mergedFields.alcoholContent;

    if (!hasBrandName || !hasAlcoholContent) {
      return "NEEDS_ATTENTION";
    }

    return "READY";
  }

  return "NEEDS_ATTENTION";
}

/**
 * Process all label images for an application.
 *
 * 1. OCR all images in parallel (fast)
 * 2. Combine all OCR text into one labeled block
 * 3. Single field extraction call with full context
 */
export async function processApplicationImages(
  applicationId: string
): Promise<ApplicationOcrResult> {
  const startTime = Date.now();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { labelImages: true },
  });

  if (!application) {
    throw new Error(`Application not found: ${applicationId}`);
  }

  // Step 1: OCR all images in parallel
  const ocrSettled = await Promise.allSettled(
    application.labelImages.map(async (image): Promise<ImageOcrResult> => {
      const ocrResult = await extractRawText(image.blobUrl);
      return {
        imageId: image.id,
        imageType: image.imageType,
        rawMarkdown: ocrResult.rawMarkdown,
        processingTimeMs: ocrResult.processingTimeMs,
        modelVersion: ocrResult.modelVersion,
      };
    })
  );

  const ocrResults: ImageOcrResult[] = [];
  const results: ApplicationOcrResult["results"] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const outcome of ocrSettled) {
    if (outcome.status === "fulfilled") {
      ocrResults.push(outcome.value);
    } else {
      const idx = results.length + ocrResults.length;
      results.push({
        imageId: application.labelImages[idx]?.id ?? "unknown",
        imageType: application.labelImages[idx]?.imageType ?? "UNKNOWN",
        success: false,
        error: outcome.reason instanceof Error ? outcome.reason.message : "Unknown error",
        processingTimeMs: 0,
      });
      errorCount++;
    }
  }

  // Step 2: Combine all OCR text and run single field extraction
  let extractedFields: ExtractedFields = {
    brandName: null,
    classType: null,
    alcoholContent: null,
    netContents: null,
    governmentWarning: null,
    bottlerName: null,
    bottlerAddress: null,
    countryOfOrigin: null,
  };
  let confidenceScores: Partial<Record<FieldType, number>> = {};

  if (ocrResults.length > 0 && isFieldExtractionConfigured()) {
    // Build combined markdown with image type labels
    const combinedMarkdown = ocrResults
      .map((r) => `<label_image type="${r.imageType}">\n${r.rawMarkdown}\n</label_image>`)
      .join("\n\n");

    try {
      const fields = await extractFieldsFromMarkdown(combinedMarkdown);
      extractedFields = fields.extractedFields;
      confidenceScores = fields.confidenceScores;
    } catch (error) {
      console.error("Field extraction failed, continuing with raw text only:", error);
    }
  }

  // Step 3: Save OCR results to database
  for (const ocr of ocrResults) {
    try {
      await prisma.ocrResult.create({
        data: {
          imageId: ocr.imageId,
          rawMarkdown: ocr.rawMarkdown,
          extractedFields: JSON.stringify(extractedFields),
          confidenceScores: JSON.stringify(confidenceScores),
          modelVersion: ocr.modelVersion,
          processedAt: new Date(),
          processingTimeMs: ocr.processingTimeMs,
        },
      });

      results.push({
        imageId: ocr.imageId,
        imageType: ocr.imageType,
        success: true,
        extractedFields,
        processingTimeMs: ocr.processingTimeMs,
      });
      successCount++;
    } catch (error) {
      console.error("Failed to save OCR result, continuing:", error);
      results.push({
        imageId: ocr.imageId,
        imageType: ocr.imageType,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processingTimeMs: ocr.processingTimeMs,
      });
      errorCount++;
    }
  }

  const mergedFields = successCount > 0 ? extractedFields : undefined;
  const newStatus = determineApplicationStatus(successCount, errorCount, mergedFields);

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus },
  });

  return {
    applicationId,
    imagesProcessed: application.labelImages.length,
    successCount,
    errorCount,
    totalProcessingTimeMs: Date.now() - startTime,
    results,
    mergedFields,
    newStatus,
  };
}

/**
 * Process multiple applications in sequence
 */
export async function processMultipleApplications(
  applicationIds: string[]
): Promise<ApplicationOcrResult[]> {
  const results: ApplicationOcrResult[] = [];

  for (const id of applicationIds) {
    try {
      await prisma.application.update({
        where: { id },
        data: { status: "PROCESSING" },
      });

      const result = await processApplicationImages(id);
      results.push(result);
    } catch (error) {
      await prisma.application.update({
        where: { id },
        data: { status: "ERROR" },
      });

      results.push({
        applicationId: id,
        imagesProcessed: 0,
        successCount: 0,
        errorCount: 1,
        totalProcessingTimeMs: 0,
        results: [],
        newStatus: "ERROR",
      });
    }
  }

  return results;
}

/**
 * Get OCR configuration status for UI display
 */
export function getOcrStatus(): {
  configured: boolean;
  fieldExtractionConfigured: boolean;
  message: string;
} {
  const ocrReady = isOcrConfigured();
  const fieldsReady = isFieldExtractionConfigured();

  if (ocrReady && fieldsReady) {
    return {
      configured: true,
      fieldExtractionConfigured: true,
      message: "Mistral OCR and Azure OpenAI field extraction configured",
    };
  }

  if (ocrReady) {
    return {
      configured: true,
      fieldExtractionConfigured: false,
      message: "Mistral OCR configured. Azure OpenAI not set — field extraction disabled.",
    };
  }

  return {
    configured: false,
    fieldExtractionConfigured: false,
    message: "MISTRAL_API_KEY not set — using mock OCR results for demo",
  };
}
