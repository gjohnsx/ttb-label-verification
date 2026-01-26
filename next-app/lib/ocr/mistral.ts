/**
 * Mistral OCR wrapper for extracting text from label images
 *
 * Uses Mistral's Pixtral vision model to analyze label images
 * and extract structured fields for TTB compliance verification.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Mistral } from "@mistralai/mistralai";
import type { ExtractedFields, FieldType } from "@/lib/comparison/types";
import { generateSasUrl, isAzureBlobUrl } from "@/lib/storage/blob";
import { LABEL_EXTRACTION_PROMPT } from "./prompts";

// Model configuration
const PIXTRAL_MODEL = "pixtral-large-2411";
const MODEL_VERSION = "pixtral-large-2411";
const SUPPORTED_IMAGE_MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};
const UNSUPPORTED_IMAGE_MIME_TYPES = new Set(["image/svg+xml"]);

function getMimeTypeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = SUPPORTED_IMAGE_MIME_TYPES[ext];
  if (!mimeType) {
    throw new Error(
      `Unsupported image type for OCR: ${ext || "unknown"}. Use JPG or TIFF.`
    );
  }
  return mimeType;
}

async function filePathToDataUrl(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  const mimeType = getMimeTypeFromPath(filePath);
  return `data:${mimeType};base64,${data.toString("base64")}`;
}

async function httpUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image for OCR: ${url} (${response.status})`);
  }

  const contentTypeHeader = response.headers.get("content-type");
  const contentType =
    contentTypeHeader?.split(";")[0] ?? getMimeTypeFromPath(new URL(url).pathname);
  const normalizedContentType = contentType.toLowerCase();

  if (!normalizedContentType.startsWith("image/")) {
    throw new Error(`Unsupported content type for OCR: ${contentType}`);
  }

  if (UNSUPPORTED_IMAGE_MIME_TYPES.has(normalizedContentType)) {
    throw new Error("SVG images are not supported for OCR. Use JPG or TIFF.");
  }

  const arrayBuffer = await response.arrayBuffer();
  return `data:${normalizedContentType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
}

async function resolveImageUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("data:image/")) {
    return imageUrl;
  }

  if (isAzureBlobUrl(imageUrl)) {
    const sasUrl = await generateSasUrl(imageUrl);
    if (sasUrl.startsWith("https://")) {
      return sasUrl;
    }
    if (sasUrl.startsWith("http://")) {
      return httpUrlToDataUrl(sasUrl);
    }
  }

  if (imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("http://")) {
    return httpUrlToDataUrl(imageUrl);
  }

  if (imageUrl.startsWith("/")) {
    const relativePath = imageUrl.replace(/^\/+/, "");
    const filePath = path.join(process.cwd(), "public", relativePath);
    return filePathToDataUrl(filePath);
  }

  return filePathToDataUrl(path.resolve(process.cwd(), imageUrl));
}

/**
 * Result of OCR extraction from a label image
 */
export interface OcrExtractResult {
  /** Raw markdown/text from the OCR response */
  rawMarkdown: string;
  /** Structured fields extracted from the label */
  extractedFields: ExtractedFields;
  /** Confidence scores for each extracted field (0-1) */
  confidenceScores: Partial<Record<FieldType, number>>;
  /** Time taken to process in milliseconds */
  processingTimeMs: number;
  /** Model version used for extraction */
  modelVersion: string;
}

/**
 * Raw response structure from Mistral vision model
 */
interface MistralExtractedResponse {
  brandName?: string | null;
  classType?: string | null;
  alcoholContent?: string | null;
  netContents?: string | null;
  governmentWarning?: string | null;
  bottlerName?: string | null;
  bottlerAddress?: string | null;
  countryOfOrigin?: string | null;
  confidence?: Partial<Record<FieldType, number>>;
}

/**
 * Check if Mistral OCR is properly configured
 */
export function isOcrConfigured(): boolean {
  return !!process.env.MISTRAL_API_KEY;
}

/**
 * Get Mistral client instance
 * Returns null if not configured
 */
function getMistralClient(): Mistral | null {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Mistral({ apiKey });
}

/**
 * Parse JSON response from Mistral, handling potential formatting issues
 */
function parseJsonResponse(content: string): MistralExtractedResponse {
  // Remove markdown code blocks if present
  let cleanContent = content.trim();

  // Handle ```json ... ``` formatting
  if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(cleanContent);
  } catch {
    console.error("Failed to parse Mistral response as JSON:", content);
    throw new Error("Invalid JSON response from Mistral vision model");
  }
}

/**
 * Convert MistralExtractedResponse to ExtractedFields
 */
function toExtractedFields(response: MistralExtractedResponse): ExtractedFields {
  return {
    brandName: response.brandName ?? null,
    classType: response.classType ?? null,
    alcoholContent: response.alcoholContent ?? null,
    netContents: response.netContents ?? null,
    governmentWarning: response.governmentWarning ?? null,
    bottlerName: response.bottlerName ?? null,
    bottlerAddress: response.bottlerAddress ?? null,
    countryOfOrigin: response.countryOfOrigin ?? null,
    confidenceScores: response.confidence,
  };
}

/**
 * Extract label text from an image URL using Mistral Pixtral vision model
 *
 * @param imageUrl - URL of the label image to analyze
 * @returns Structured extraction result with fields and confidence scores
 */
export async function extractLabelText(imageUrl: string): Promise<OcrExtractResult> {
  const startTime = Date.now();
  const client = getMistralClient();

  if (!client) {
    console.warn("MISTRAL_API_KEY not configured, returning mock OCR result");
    return getMockOcrResult(startTime);
  }

  try {
    const resolvedImageUrl = await resolveImageUrl(imageUrl);
    const response = await client.chat.complete({
      model: PIXTRAL_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: LABEL_EXTRACTION_PROMPT,
            },
            {
              type: "image_url",
              imageUrl: {
                url: resolvedImageUrl,
              },
            },
          ],
        },
      ],
    });

    const processingTimeMs = Date.now() - startTime;

    // Extract content from response
    const choice = response.choices?.[0];
    if (!choice || !choice.message?.content) {
      throw new Error("No response content from Mistral vision model");
    }

    const rawContent =
      typeof choice.message.content === "string"
        ? choice.message.content
        : JSON.stringify(choice.message.content);

    // Parse the JSON response
    const parsed = parseJsonResponse(rawContent);
    const extractedFields = toExtractedFields(parsed);

    return {
      rawMarkdown: rawContent,
      extractedFields,
      confidenceScores: parsed.confidence ?? {},
      processingTimeMs,
      modelVersion: MODEL_VERSION,
    };
  } catch (error) {
    const processingTimeMs = Date.now() - startTime;
    console.error("Mistral OCR extraction failed:", error);

    // Return error result with empty fields
    return {
      rawMarkdown: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      extractedFields: {
        brandName: null,
        classType: null,
        alcoholContent: null,
        netContents: null,
        governmentWarning: null,
        bottlerName: null,
        bottlerAddress: null,
        countryOfOrigin: null,
      },
      confidenceScores: {},
      processingTimeMs,
      modelVersion: MODEL_VERSION,
    };
  }
}

/**
 * Extract label text from multiple images and merge results
 *
 * @param imageUrls - Array of label image URLs to analyze
 * @returns Array of extraction results, one per image
 */
export async function extractMultipleLabels(
  imageUrls: string[]
): Promise<OcrExtractResult[]> {
  // Process images in parallel for speed
  const results = await Promise.all(imageUrls.map((url) => extractLabelText(url)));
  return results;
}

/**
 * Generate mock OCR result for demo/testing when API key is not configured
 */
function getMockOcrResult(startTime: number): OcrExtractResult {
  const processingTimeMs = Date.now() - startTime + 500; // Simulate some delay

  return {
    rawMarkdown: JSON.stringify({
      brandName: "Demo Brand",
      classType: "Blended Whiskey",
      alcoholContent: "40% Alc./Vol.",
      netContents: "750 mL",
      governmentWarning:
        "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
      bottlerName: "Demo Distillery Co.",
      bottlerAddress: "123 Main Street, Louisville, KY 40202",
      countryOfOrigin: "United States",
      confidence: {
        brandName: 0.95,
        classType: 0.85,
        alcoholContent: 0.98,
        netContents: 0.95,
        governmentWarning: 0.9,
        bottlerName: 0.8,
        bottlerAddress: 0.75,
        countryOfOrigin: 0.92,
      },
    }),
    extractedFields: {
      brandName: "Demo Brand",
      classType: "Blended Whiskey",
      alcoholContent: "40% Alc./Vol.",
      netContents: "750 mL",
      governmentWarning:
        "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
      bottlerName: "Demo Distillery Co.",
      bottlerAddress: "123 Main Street, Louisville, KY 40202",
      countryOfOrigin: "United States",
      confidenceScores: {
        brandName: 0.95,
        classType: 0.85,
        alcoholContent: 0.98,
        netContents: 0.95,
        governmentWarning: 0.9,
        bottlerName: 0.8,
        bottlerAddress: 0.75,
        countryOfOrigin: 0.92,
      },
    },
    confidenceScores: {
      brandName: 0.95,
      classType: 0.85,
      alcoholContent: 0.98,
      netContents: 0.95,
      governmentWarning: 0.9,
      bottlerName: 0.8,
      bottlerAddress: 0.75,
      countryOfOrigin: 0.92,
    },
    processingTimeMs,
    modelVersion: "mock-demo",
  };
}
