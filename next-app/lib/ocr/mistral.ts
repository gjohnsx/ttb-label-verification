/**
 * Mistral OCR wrapper for extracting raw text from label images
 *
 * Uses Mistral's dedicated OCR model (mistral-ocr-latest) for accurate
 * text extraction. Structured field extraction is handled separately
 * by extract-fields.ts via Azure OpenAI.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Mistral } from "@mistralai/mistralai";
import { generateSasUrl, isAzureBlobUrl } from "@/lib/storage/blob";

// Model configuration
const OCR_MODEL = "mistral-ocr-latest";
const MODEL_VERSION = "mistral-ocr-latest";
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
 * Result of raw OCR text extraction from a label image
 */
export interface OcrRawResult {
  /** Raw markdown text from the OCR response */
  rawMarkdown: string;
  /** Time taken to process in milliseconds */
  processingTimeMs: number;
  /** Model version used for extraction */
  modelVersion: string;
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
 * Extract raw text from an image using Mistral OCR
 */
async function performOcr(client: Mistral, imageUrl: string): Promise<string> {
  const ocrResponse = await client.ocr.process({
    model: OCR_MODEL,
    document: {
      type: "image_url",
      imageUrl: imageUrl,
    },
    includeImageBase64: false,
  });

  // Combine all pages' markdown content
  const pages = ocrResponse.pages ?? [];
  const rawMarkdown = pages.map((page) => page.markdown).join("\n\n---\n\n");

  return rawMarkdown;
}

/**
 * Extract raw text from a label image URL using Mistral OCR
 *
 * @param imageUrl - URL of the label image to analyze
 * @returns Raw OCR markdown text
 */
export async function extractRawText(imageUrl: string): Promise<OcrRawResult> {
  const startTime = Date.now();
  const client = getMistralClient();

  if (!client) {
    console.warn("MISTRAL_API_KEY not configured, returning mock OCR result");
    return getMockOcrResult(startTime);
  }

  // Resolve the image URL (handle Azure blobs, local files, etc.)
  const resolvedImageUrl = await resolveImageUrl(imageUrl);

  // Extract raw text using OCR model
  const rawMarkdown = await performOcr(client, resolvedImageUrl);

  if (!rawMarkdown || rawMarkdown.trim().length === 0) {
    throw new Error("OCR returned empty result - could not extract text from image");
  }

  return {
    rawMarkdown,
    processingTimeMs: Date.now() - startTime,
    modelVersion: MODEL_VERSION,
  };
}

/**
 * Generate mock OCR result for demo/testing when API key is not configured
 */
function getMockOcrResult(startTime: number): OcrRawResult {
  return {
    rawMarkdown: [
      "# Demo Brand",
      "",
      "Blended Whiskey",
      "",
      "40% Alc./Vol. | 750 mL",
      "",
      "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
      "",
      "Bottled by Demo Distillery Co.",
      "123 Main Street, Louisville, KY 40202",
      "",
      "Product of United States",
    ].join("\n"),
    processingTimeMs: Date.now() - startTime + 500,
    modelVersion: "mock-demo",
  };
}
