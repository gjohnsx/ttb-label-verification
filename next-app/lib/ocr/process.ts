/**
 * Application OCR processing functions
 *
 * Handles processing label images for applications and storing
 * OCR results in the database.
 */

import prisma from "@/lib/prisma";
import { extractLabelText, isOcrConfigured, type OcrExtractResult } from "./mistral";
import type { ExtractedFields } from "@/lib/comparison/types";

/**
 * Result of processing all images for an application
 */
export interface ApplicationOcrResult {
  /** Application ID that was processed */
  applicationId: string;
  /** Number of images processed */
  imagesProcessed: number;
  /** Number of successful extractions */
  successCount: number;
  /** Number of failed extractions */
  errorCount: number;
  /** Total processing time in milliseconds */
  totalProcessingTimeMs: number;
  /** Individual results per image */
  results: Array<{
    imageId: string;
    imageType: string;
    success: boolean;
    error?: string;
    extractedFields?: ExtractedFields;
    processingTimeMs: number;
  }>;
  /** Merged fields from all successful extractions */
  mergedFields?: ExtractedFields;
  /** Final application status after processing */
  newStatus: string;
}

/**
 * Merge extracted fields from multiple images
 * Uses confidence scores to pick the best value for each field
 */
function mergeExtractedFields(results: OcrExtractResult[]): ExtractedFields {
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

  // For each field, pick the value with highest confidence
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

/**
 * Determine application status based on OCR results
 */
function determineApplicationStatus(
  successCount: number,
  errorCount: number,
  mergedFields: ExtractedFields | undefined
): string {
  // If all failed, set to ERROR
  if (successCount === 0 && errorCount > 0) {
    return "ERROR";
  }

  // If we have some results, check if we have critical fields
  if (mergedFields) {
    const hasBrandName = !!mergedFields.brandName;
    const hasAlcoholContent = !!mergedFields.alcoholContent;

    // Missing critical fields = needs attention
    if (!hasBrandName || !hasAlcoholContent) {
      return "NEEDS_ATTENTION";
    }

    // All good = ready for review
    return "READY";
  }

  return "NEEDS_ATTENTION";
}

/**
 * Process all label images for an application
 *
 * @param applicationId - The ID of the application to process
 * @returns Processing result with all extraction details
 */
export async function processApplicationImages(
  applicationId: string
): Promise<ApplicationOcrResult> {
  const startTime = Date.now();

  // Fetch application with label images
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      labelImages: true,
    },
  });

  if (!application) {
    throw new Error(`Application not found: ${applicationId}`);
  }

  const results: ApplicationOcrResult["results"] = [];
  const ocrResults: OcrExtractResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  // Process each image
  for (const image of application.labelImages) {
    try {
      const ocrResult = await extractLabelText(image.blobUrl);

      // Store OCR result in database
      await prisma.ocrResult.create({
        data: {
          imageId: image.id,
          rawMarkdown: ocrResult.rawMarkdown,
          extractedFields: JSON.stringify(ocrResult.extractedFields),
          confidenceScores: JSON.stringify(ocrResult.confidenceScores),
          modelVersion: ocrResult.modelVersion,
          processedAt: new Date(),
          processingTimeMs: ocrResult.processingTimeMs,
        },
      });

      ocrResults.push(ocrResult);
      results.push({
        imageId: image.id,
        imageType: image.imageType,
        success: true,
        extractedFields: ocrResult.extractedFields,
        processingTimeMs: ocrResult.processingTimeMs,
      });
      successCount++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.push({
        imageId: image.id,
        imageType: image.imageType,
        success: false,
        error: errorMessage,
        processingTimeMs: 0,
      });
      errorCount++;
    }
  }

  // Merge results from all images
  const mergedFields = ocrResults.length > 0 ? mergeExtractedFields(ocrResults) : undefined;

  // Determine new status
  const newStatus = determineApplicationStatus(successCount, errorCount, mergedFields);

  // Update application status
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus },
  });

  const totalProcessingTimeMs = Date.now() - startTime;

  return {
    applicationId,
    imagesProcessed: application.labelImages.length,
    successCount,
    errorCount,
    totalProcessingTimeMs,
    results,
    mergedFields,
    newStatus,
  };
}

/**
 * Process multiple applications in sequence
 *
 * @param applicationIds - Array of application IDs to process
 * @returns Array of processing results
 */
export async function processMultipleApplications(
  applicationIds: string[]
): Promise<ApplicationOcrResult[]> {
  const results: ApplicationOcrResult[] = [];

  for (const id of applicationIds) {
    try {
      // Update status to PROCESSING before starting
      await prisma.application.update({
        where: { id },
        data: { status: "PROCESSING" },
      });

      const result = await processApplicationImages(id);
      results.push(result);
    } catch (error) {
      // Mark as error if processing fails completely
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
  message: string;
} {
  if (isOcrConfigured()) {
    return {
      configured: true,
      message: "Mistral OCR is configured and ready",
    };
  }

  return {
    configured: false,
    message: "MISTRAL_API_KEY not set - using mock OCR results for demo",
  };
}
