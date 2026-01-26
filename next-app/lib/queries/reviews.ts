import prisma from "@/lib/prisma";
import type { ApplicationData, ExtractedFields } from "@/lib/comparison/types";
import { processApplicationImages } from "@/lib/ocr/process";

/**
 * Full application data with optional comparison and OCR data for review
 */
export type ApplicationForReview = {
  id: string;
  colaId: string | null;
  brandName: string;
  classType: string | null;
  alcoholContent: string | null;
  netContents: string | null;
  governmentWarning: string | null;
  bottlerName: string | null;
  bottlerAddress: string | null;
  countryOfOrigin: string | null;
  status: string;
  createdAt: Date;
  comparison: {
    id: string;
    matchResults: string | null;
    overallStatus: string | null;
    mismatchCount: number | null;
    computedAt: Date | null;
  } | null;
  labelImages: {
    id: string;
    blobUrl: string;
    imageType: string;
    ocrResults: {
      extractedFields: string | null;
      confidenceScores: string | null;
    }[];
  }[];
};

/**
 * Fetch an application with all data needed for review,
 * including any existing comparison and OCR results.
 */
export async function getApplicationForReview(
  id: string
): Promise<ApplicationForReview | null> {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      comparisons: {
        orderBy: { computedAt: "desc" },
        take: 1,
      },
      labelImages: {
        include: {
          ocrResults: {
            orderBy: { processedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!application) {
    return null;
  }

  return {
    id: application.id,
    colaId: application.colaId,
    brandName: application.brandName,
    classType: application.classType,
    alcoholContent: application.alcoholContent,
    netContents: application.netContents,
    governmentWarning: application.governmentWarning,
    bottlerName: application.bottlerName,
    bottlerAddress: application.bottlerAddress,
    countryOfOrigin: application.countryOfOrigin,
    status: application.status,
    createdAt: application.createdAt,
    comparison: application.comparisons[0]
      ? {
          id: application.comparisons[0].id,
          matchResults: application.comparisons[0].matchResults,
          overallStatus: application.comparisons[0].overallStatus,
          mismatchCount: application.comparisons[0].mismatchCount,
          computedAt: application.comparisons[0].computedAt,
        }
      : null,
    labelImages: application.labelImages.map((img) => ({
      id: img.id,
      blobUrl: img.blobUrl,
      imageType: img.imageType,
      ocrResults: img.ocrResults.map((ocr) => ({
        extractedFields: ocr.extractedFields,
        confidenceScores: ocr.confidenceScores,
      })),
    })),
  };
}

/**
 * Convert application data to the format expected by the comparison engine
 */
export function toApplicationData(
  application: ApplicationForReview
): ApplicationData {
  return {
    id: application.id,
    brandName: application.brandName,
    classType: application.classType,
    alcoholContent: application.alcoholContent,
    netContents: application.netContents,
    governmentWarning: application.governmentWarning,
    bottlerName: application.bottlerName,
    bottlerAddress: application.bottlerAddress,
    countryOfOrigin: application.countryOfOrigin,
  };
}

/**
 * Extract OCR fields from an application's label images
 * Merges fields from all images, preferring higher confidence scores
 */
export function extractOcrFields(
  application: ApplicationForReview
): ExtractedFields | null {
  // Collect all OCR results from all images
  const allOcrResults = application.labelImages.flatMap(
    (img) => img.ocrResults
  );

  if (allOcrResults.length === 0) {
    return null;
  }

  // Merge extracted fields, preferring first non-null value for each field
  const mergedFields: ExtractedFields = {};
  const mergedConfidence: Partial<Record<string, number>> = {};

  for (const ocr of allOcrResults) {
    if (ocr.extractedFields) {
      try {
        const fields = JSON.parse(ocr.extractedFields) as ExtractedFields;
        const confidence = ocr.confidenceScores
          ? (JSON.parse(ocr.confidenceScores) as Record<string, number>)
          : {};

        // Merge each field if not already set
        for (const key of Object.keys(fields) as (keyof ExtractedFields)[]) {
          if (key === "confidenceScores") continue;
          if (!mergedFields[key] && fields[key]) {
            mergedFields[key] = fields[key];
            if (confidence[key]) {
              mergedConfidence[key] = confidence[key];
            }
          }
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }

  if (Object.keys(mergedConfidence).length > 0) {
    mergedFields.confidenceScores = mergedConfidence as ExtractedFields["confidenceScores"];
  }

  return mergedFields;
}

/**
 * Check if an application has OCR results
 */
export function hasOcrResults(application: ApplicationForReview): boolean {
  return application.labelImages.some(
    (img) => img.ocrResults.length > 0 && img.ocrResults[0].extractedFields
  );
}

/**
 * Get the most recent OCR processing timestamp for an application
 */
export async function getOcrProcessedAt(
  applicationId: string
): Promise<Date | null> {
  const result = await prisma.ocrResult.findFirst({
    where: {
      image: {
        applicationId,
      },
    },
    orderBy: { processedAt: "desc" },
    select: { processedAt: true },
  });

  return result?.processedAt ?? null;
}

/**
 * Ensure OCR results exist for an application, processing if needed
 * Returns true if OCR results are available, false if processing failed
 */
export async function ensureOcrResults(
  applicationId: string
): Promise<{ hasResults: boolean; error?: string }> {
  // First check if OCR results already exist
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      labelImages: {
        include: {
          ocrResults: {
            orderBy: { processedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!application) {
    return { hasResults: false, error: "Application not found" };
  }

  // Check if we already have OCR results
  const hasExistingResults = application.labelImages.some(
    (img) => img.ocrResults.length > 0
  );

  if (hasExistingResults) {
    return { hasResults: true };
  }

  // No existing results - trigger OCR processing
  try {
    await processApplicationImages(applicationId);
    return { hasResults: true };
  } catch (error) {
    console.error("Failed to process OCR for application:", applicationId, error);
    return {
      hasResults: false,
      error: error instanceof Error ? error.message : "OCR processing failed",
    };
  }
}
