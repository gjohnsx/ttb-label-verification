/**
 * OCR Module - Barrel exports
 *
 * Provides OCR extraction functionality for TTB label verification
 * using Mistral's Pixtral vision model.
 *
 * @example
 * ```typescript
 * import { extractLabelText, processApplicationImages, isOcrConfigured } from '@/lib/ocr';
 *
 * // Check if OCR is configured
 * if (isOcrConfigured()) {
 *   // Extract from a single image
 *   const result = await extractLabelText('https://example.com/label.jpg');
 *   console.log(result.extractedFields.brandName);
 *
 *   // Process all images for an application
 *   const appResult = await processApplicationImages('app-123');
 *   console.log(appResult.mergedFields);
 * }
 * ```
 */

// Core extraction functions
export {
  extractLabelText,
  extractMultipleLabels,
  isOcrConfigured,
  type OcrExtractResult,
} from "./mistral";

// Application processing functions
export {
  processApplicationImages,
  processMultipleApplications,
  getOcrStatus,
  type ApplicationOcrResult,
} from "./process";

// Prompts (exported for customization if needed)
export { LABEL_EXTRACTION_PROMPT, QUICK_EXTRACTION_PROMPT } from "./prompts";
