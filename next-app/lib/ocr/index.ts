/**
 * OCR Module - Barrel exports
 *
 * Two-step extraction pipeline:
 * 1. Mistral OCR → raw markdown text from label images
 * 2. Azure OpenAI → structured fields + confidence scores
 */

// Mistral OCR - raw text extraction
export { extractRawText, isOcrConfigured, type OcrRawResult } from "./mistral";

// Azure OpenAI - structured field extraction
export {
  extractFieldsFromMarkdown,
  isFieldExtractionConfigured,
  type FieldExtractionResult,
} from "./extract-fields";

// Application processing (orchestrates both steps)
export {
  processApplicationImages,
  processMultipleApplications,
  getOcrStatus,
  type ApplicationOcrResult,
} from "./process";

// Prompts
export { LABEL_EXTRACTION_PROMPT, QUICK_EXTRACTION_PROMPT } from "./prompts";
