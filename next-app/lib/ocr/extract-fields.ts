/**
 * Structured field extraction from OCR text using Azure OpenAI
 *
 * Takes raw markdown from Mistral OCR and extracts structured
 * TTB label fields using Azure OpenAI's chat completion API.
 */

import type { ExtractedFields, FieldType } from "@/lib/comparison/types";
import { LABEL_EXTRACTION_PROMPT } from "./prompts";

/**
 * Result of structured field extraction
 */
export interface FieldExtractionResult {
  extractedFields: ExtractedFields;
  confidenceScores: Partial<Record<FieldType, number>>;
}

/**
 * Raw JSON response shape from the LLM
 */
interface LlmExtractedResponse {
  brandName?: string | null;
  classType?: string | null;
  alcoholContent?: string | null;
  netContents?: string | null;
  governmentWarning?: string | null;
  bottlerName?: string | null;
  bottlerAddress?: string | null;
  countryOfOrigin?: string | null;
  confidence?: Partial<Record<FieldType, number>>;
  confidenceScores?: Partial<Record<FieldType, number>>;
}

/**
 * Check if Azure OpenAI field extraction is configured
 */
export function isFieldExtractionConfigured(): boolean {
  return !!(
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_API_KEY
  );
}

/**
 * Extract structured fields from raw OCR markdown using Azure OpenAI
 */
export async function extractFieldsFromMarkdown(
  rawMarkdown: string
): Promise<FieldExtractionResult> {
  const { AzureOpenAI } = await import("openai");

  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-5-nano";

  const client = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion: "2024-12-01-preview",
    deployment,
  });

  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      { role: "system", content: LABEL_EXTRACTION_PROMPT },
      { role: "user", content: rawMarkdown },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Azure OpenAI returned empty response for field extraction");
  }

  const parsed = parseResponse(content);

  return {
    extractedFields: {
      brandName: parsed.brandName ?? null,
      classType: parsed.classType ?? null,
      alcoholContent: parsed.alcoholContent ?? null,
      netContents: parsed.netContents ?? null,
      governmentWarning: parsed.governmentWarning ?? null,
      bottlerName: parsed.bottlerName ?? null,
      bottlerAddress: parsed.bottlerAddress ?? null,
      countryOfOrigin: parsed.countryOfOrigin ?? null,
      confidenceScores: parsed.confidenceScores ?? parsed.confidence,
    },
    confidenceScores: parsed.confidenceScores ?? parsed.confidence ?? {},
  };
}

function parseResponse(content: string): LlmExtractedResponse {
  let clean = content.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(clean);
  } catch {
    console.error("Failed to parse Azure OpenAI response as JSON:", content);
    throw new Error("Invalid JSON response from Azure OpenAI field extraction");
  }
}
