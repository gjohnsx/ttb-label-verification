/**
 * Bounding Box Test API Route
 *
 * Processes a label image through:
 * 1. Mistral OCR to extract text fields
 * 2. Gemini to detect bounding boxes for each element
 *
 * POST /api/bbox-test
 * Body: { imageDataUrl: string } (base64 data URL)
 */

import { NextResponse } from "next/server";
import {
  extractLabelText,
  isOcrConfigured,
  detectBoundingBoxes,
  isGeminiConfigured,
} from "@/lib/ocr";

interface RequestBody {
  imageDataUrl: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.imageDataUrl) {
      return NextResponse.json(
        { error: "imageDataUrl is required" },
        { status: 400 }
      );
    }

    // Validate that it's a data URL
    if (!body.imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "imageDataUrl must be a valid base64 data URL" },
        { status: 400 }
      );
    }

    // Get configuration status
    const ocrConfigured = isOcrConfigured();
    const geminiConfigured = isGeminiConfigured();

    // Run OCR extraction (Mistral) and bounding box detection (Gemini) in parallel
    const [ocrResult, bboxResult] = await Promise.all([
      extractLabelText(body.imageDataUrl),
      detectBoundingBoxes(body.imageDataUrl),
    ]);

    return NextResponse.json({
      success: true,
      config: {
        ocrConfigured,
        geminiConfigured,
        message: !ocrConfigured
          ? "Using mock OCR results (MISTRAL_API_KEY not set)"
          : !geminiConfigured
            ? "Using mock bounding boxes (GOOGLE_API_KEY not set)"
            : "Both Mistral OCR and Gemini bounding boxes are configured",
      },
      ocr: {
        extractedFields: ocrResult.extractedFields,
        confidenceScores: ocrResult.confidenceScores,
        processingTimeMs: ocrResult.processingTimeMs,
        modelVersion: ocrResult.modelVersion,
      },
      boundingBoxes: {
        boxes: bboxResult.boxes,
        processingTimeMs: bboxResult.processingTimeMs,
        modelVersion: bboxResult.modelVersion,
      },
    });
  } catch (error) {
    console.error("Bbox test processing error:", error);
    return NextResponse.json(
      {
        error: "Processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bbox-test
 * Returns configuration status
 */
export async function GET() {
  const ocrConfigured = isOcrConfigured();
  const geminiConfigured = isGeminiConfigured();

  return NextResponse.json({
    status: "ok",
    config: {
      ocrConfigured,
      geminiConfigured,
      message: !ocrConfigured
        ? "Mistral API not configured - will use mock OCR results"
        : !geminiConfigured
          ? "Gemini API not configured - will use mock bounding boxes"
          : "Both Mistral OCR and Gemini bounding boxes are configured",
    },
  });
}
