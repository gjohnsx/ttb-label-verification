/**
 * OCR Processing API Route
 *
 * Triggers OCR processing for a specific application's label images.
 *
 * POST /api/applications/[id]/ocr
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processApplicationImages, getOcrStatus } from "@/lib/ocr";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        labelImages: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if there are images to process
    if (application.labelImages.length === 0) {
      return NextResponse.json(
        { error: "No label images found for this application" },
        { status: 400 }
      );
    }

    // Update status to PROCESSING
    await prisma.application.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    // Process all images
    const result = await processApplicationImages(id);

    // Get OCR configuration status for response
    const ocrStatus = getOcrStatus();

    return NextResponse.json({
      success: true,
      ocrConfigured: ocrStatus.configured,
      ocrMessage: ocrStatus.message,
      ...result,
    });
  } catch (error) {
    console.error("OCR processing error:", error);

    // Attempt to reset status to error
    try {
      await prisma.application.update({
        where: { id },
        data: { status: "ERROR" },
      });
    } catch {
      // Ignore update errors
    }

    return NextResponse.json(
      {
        error: "OCR processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications/[id]/ocr
 *
 * Get existing OCR results for an application
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch application with OCR results
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        labelImages: {
          include: {
            ocrResults: {
              orderBy: { processedAt: "desc" },
              take: 1, // Get only the most recent result per image
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get OCR configuration status
    const ocrStatus = getOcrStatus();

    // Format results
    const ocrResults = application.labelImages.map((image) => {
      const latestResult = image.ocrResults[0];
      return {
        imageId: image.id,
        imageType: image.imageType,
        blobUrl: image.blobUrl,
        hasOcrResult: !!latestResult,
        ocrResult: latestResult
          ? {
              id: latestResult.id,
              extractedFields: latestResult.extractedFields
                ? JSON.parse(latestResult.extractedFields)
                : null,
              confidenceScores: latestResult.confidenceScores
                ? JSON.parse(latestResult.confidenceScores)
                : null,
              modelVersion: latestResult.modelVersion,
              processedAt: latestResult.processedAt,
              processingTimeMs: latestResult.processingTimeMs,
            }
          : null,
      };
    });

    // Check if any images have OCR results
    const hasAnyResults = ocrResults.some((r) => r.hasOcrResult);

    return NextResponse.json({
      applicationId: id,
      applicationStatus: application.status,
      ocrConfigured: ocrStatus.configured,
      ocrMessage: ocrStatus.message,
      hasOcrResults: hasAnyResults,
      totalImages: application.labelImages.length,
      processedImages: ocrResults.filter((r) => r.hasOcrResult).length,
      images: ocrResults,
    });
  } catch (error) {
    console.error("Error fetching OCR results:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch OCR results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
