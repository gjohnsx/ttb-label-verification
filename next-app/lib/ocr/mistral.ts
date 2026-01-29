/**
 * OCR text extraction from label images
 *
 * Two provider options:
 * - "mistral": Mistral SDK (passes image URL directly, no base64 conversion)
 * - "foundry": Azure AI Foundry Mistral OCR (requires base64, same key as OpenAI)
 *
 * Toggle with OCR_PROVIDER below.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Mistral } from "@mistralai/mistralai";
import { generateSasUrl, isAzureBlobUrl } from "@/lib/storage/blob";

// ── Toggle OCR provider here ──
const OCR_PROVIDER: "mistral" | "foundry" = "mistral";

// Mistral SDK config
const MISTRAL_OCR_MODEL = "mistral-ocr-latest";

// Azure AI Foundry config
const FOUNDRY_OCR_ENDPOINT =
  process.env.AZURE_OCR_ENDPOINT ??
  "https://gregj-mkyutd7p-eastus2.services.ai.azure.com/providers/mistral/azure/ocr";
const FOUNDRY_OCR_MODEL = "mistral-document-ai-2505";

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

// ── Image resolution helpers ──

async function toBase64DataUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("data:image/")) return imageUrl;

  if (isAzureBlobUrl(imageUrl)) {
    imageUrl = await generateSasUrl(imageUrl);
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${imageUrl} (${response.status})`);
    }
    const contentType =
      response.headers.get("content-type")?.split(";")[0] ??
      getMimeTypeFromPath(new URL(imageUrl).pathname);
    const arrayBuffer = await response.arrayBuffer();
    return `data:${contentType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
  }

  const filePath = imageUrl.startsWith("/")
    ? path.join(process.cwd(), "public", imageUrl.replace(/^\/+/, ""))
    : path.resolve(process.cwd(), imageUrl);
  const data = await fs.readFile(filePath);
  const mimeType = getMimeTypeFromPath(filePath);
  return `data:${mimeType};base64,${data.toString("base64")}`;
}

async function resolveImageUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("data:image/")) return imageUrl;

  if (isAzureBlobUrl(imageUrl)) {
    const sasUrl = await generateSasUrl(imageUrl);
    if (sasUrl.startsWith("https://")) return sasUrl;
  }

  if (imageUrl.startsWith("https://")) return imageUrl;
  if (imageUrl.startsWith("http://")) return imageUrl;

  if (imageUrl.startsWith("/")) {
    const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\/+/, ""));
    return `data:${getMimeTypeFromPath(filePath)};base64,${(await fs.readFile(filePath)).toString("base64")}`;
  }

  const filePath = path.resolve(process.cwd(), imageUrl);
  return `data:${getMimeTypeFromPath(filePath)};base64,${(await fs.readFile(filePath)).toString("base64")}`;
}

// ── Types ──

export interface OcrRawResult {
  rawMarkdown: string;
  processingTimeMs: number;
  modelVersion: string;
}

// ── Provider: Mistral SDK ──

function getMistralClient(): Mistral | null {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;
  return new Mistral({ apiKey });
}

async function performOcrMistral(imageUrl: string): Promise<string> {
  const client = getMistralClient();
  if (!client) throw new Error("MISTRAL_API_KEY is not configured");

  const resolved = await resolveImageUrl(imageUrl);
  const ocrResponse = await client.ocr.process({
    model: MISTRAL_OCR_MODEL,
    document: { type: "image_url", imageUrl: resolved },
    includeImageBase64: false,
  });

  const pages = ocrResponse.pages ?? [];
  return pages.map((page) => page.markdown).join("\n\n---\n\n");
}

// ── Provider: Azure AI Foundry ──

async function performOcrFoundry(imageUrl: string): Promise<string> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("AZURE_OPENAI_API_KEY is not configured");

  const base64DataUrl = await toBase64DataUrl(imageUrl);

  const response = await fetch(FOUNDRY_OCR_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: FOUNDRY_OCR_MODEL,
      document: { type: "image_url", image_url: base64DataUrl },
      include_image_base64: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Foundry OCR failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const pages = data.pages ?? [];
  return pages
    .map((page: { markdown?: string }) => page.markdown ?? "")
    .join("\n\n---\n\n");
}

// ── Public API ──

export function isOcrConfigured(): boolean {
  if (OCR_PROVIDER === "mistral") return !!process.env.MISTRAL_API_KEY;
  return !!process.env.AZURE_OPENAI_API_KEY;
}

export async function extractRawText(imageUrl: string): Promise<OcrRawResult> {
  const startTime = Date.now();

  if (!isOcrConfigured()) {
    console.warn("OCR not configured, returning mock result");
    return getMockOcrResult(startTime);
  }

  const rawMarkdown =
    OCR_PROVIDER === "mistral"
      ? await performOcrMistral(imageUrl)
      : await performOcrFoundry(imageUrl);

  if (!rawMarkdown || rawMarkdown.trim().length === 0) {
    throw new Error("OCR returned empty result - could not extract text from image");
  }

  return {
    rawMarkdown,
    processingTimeMs: Date.now() - startTime,
    modelVersion: OCR_PROVIDER === "mistral" ? MISTRAL_OCR_MODEL : FOUNDRY_OCR_MODEL,
  };
}

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
