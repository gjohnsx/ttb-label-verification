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
  type FieldExtractionResult,
} from "./extract-fields";

/**
 * Combined result of OCR + field extraction for a single image
 */
interface ImageExtractionResult {
  rawMarkdown: string;
  extractedFields: ExtractedFields;
  confidenceScores: Partial<Record<FieldType, number>>;
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

/**
 * Process a single image: OCR then field extraction
 */
async function processImage(imageUrl: string): Promise<ImageExtractionResult> {
  // Step 1: Raw text extraction via Mistral OCR
  const ocrResult = await extractRawText(imageUrl);

  // Step 2: Structured field extraction via Azure OpenAI (if configured)
  let fields: FieldExtractionResult | null = null;
  if (isFieldExtractionConfigured()) {
    try {
      fields = await extractFieldsFromMarkdown(ocrResult.rawMarkdown);
    } catch (error) {
      console.error("Field extraction failed, continuing with raw text only:", error);
    }
  }

  return {
    rawMarkdown: ocrResult.rawMarkdown,
    extractedFields: fields?.extractedFields ?? {
      brandName: null,
      classType: null,
      alcoholContent: null,
      netContents: null,
      governmentWarning: null,
      bottlerName: null,
      bottlerAddress: null,
      countryOfOrigin: null,
    },
    confidenceScores: fields?.confidenceScores ?? {},
    processingTimeMs: ocrResult.processingTimeMs,
    modelVersion: ocrResult.modelVersion,
  };
}

/**
 * Merge extracted fields from multiple images.
 * Uses confidence scores to pick the best value for each field.
 */
function mergeExtractedFields(results: ImageExtractionResult[]): ExtractedFields {
  const merged: ExtractedFields = {
    brandName: null,
    classType: null,
    alcoholContent: null,
    netContents: null,
    governmentWarning: null,
    bottlerName: null,
    bottlerAddress: null,
    countryOfOrigin: null,
    confidenceScores: {},
  };

  const fieldKeys: (keyof Omit<ExtractedFields, "confidenceScores">)[] = [
    "brandName",
    "classType",
    "alcoholContent",
    "netContents",
    "governmentWarning",
    "bottlerName",
    "bottlerAddress",
    "countryOfOrigin",
  ];

  for (const field of fieldKeys) {
    let bestValue: string | null = null;
    let bestConfidence = 0;

    for (const result of results) {
      const value = result.extractedFields[field];
      const confidence = result.confidenceScores[field] ?? 0;

      if (value && confidence > bestConfidence) {
        bestValue = value;
        bestConfidence = confidence;
      }
    }

    merged[field] = bestValue;
    if (bestConfidence > 0) {
      merged.confidenceScores = merged.confidenceScores ?? {};
      merged.confidenceScores[field] = bestConfidence;
    }
  }

  return merged;
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
 * Process all label images for an application
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

  // Process all images in parallel
  const settled = await Promise.allSettled(
    application.labelImages.map(async (image) => {
      const result = await processImage(image.blobUrl);
      await prisma.ocrResult.create({
        data: {
          imageId: image.id,
          rawMarkdown: result.rawMarkdown,
          extractedFields: JSON.stringify(result.extractedFields),
          confidenceScores: JSON.stringify(result.confidenceScores),
          modelVersion: result.modelVersion,
          processedAt: new Date(),
          processingTimeMs: result.processingTimeMs,
        },
      });
      return { image, result };
    })
  );

  const results: ApplicationOcrResult["results"] = [];
  const imageResults: ImageExtractionResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      const { image, result } = outcome.value;
      imageResults.push(result);
      results.push({
        imageId: image.id,
        imageType: image.imageType,
        success: true,
        extractedFields: result.extractedFields,
        processingTimeMs: result.processingTimeMs,
      });
      successCount++;
    } else {
      results.push({
        imageId: application.labelImages[results.length]?.id ?? "unknown",
        imageType: application.labelImages[results.length]?.imageType ?? "UNKNOWN",
        success: false,
        error: outcome.reason instanceof Error ? outcome.reason.message : "Unknown error",
        processingTimeMs: 0,
      });
      errorCount++;
    }
  }

  const mergedFields = imageResults.length > 0 ? mergeExtractedFields(imageResults) : undefined;
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
