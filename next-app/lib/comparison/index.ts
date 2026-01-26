/**
 * TTB Label Verification - Comparison Engine
 *
 * This module provides functionality for comparing application data
 * against OCR-extracted values from label images.
 *
 * @example
 * ```typescript
 * import { compareApplication, type ApplicationData, type ExtractedFields } from '@/lib/comparison';
 *
 * const application: ApplicationData = {
 *   id: 'app-123',
 *   brandName: "Jack Daniel's",
 *   alcoholContent: '40%',
 *   netContents: '750 mL',
 * };
 *
 * const ocrFields: ExtractedFields = {
 *   brandName: 'Jack Daniels',
 *   alcoholContent: '40% Alc./Vol.',
 *   netContents: '750ml',
 * };
 *
 * const result = compareApplication(application, ocrFields);
 * console.log(result.overallStatus); // 'MATCH' or 'NEEDS_REVIEW' or 'MISMATCH'
 * ```
 */

// Export all types
export type {
  FieldType,
  MatchStatus,
  ConfidenceLevel,
  OverallStatus,
  FieldComparison,
  ComparisonResult,
  ApplicationData,
  ExtractedFields,
  ComparisonOptions,
} from './types';

// Export main comparison functions
export {
  compareApplication,
  compareApplications,
  quickCompare,
  fieldMatches,
} from './compare';

// Export normalization functions for individual use
export {
  normalizeBrandName,
  normalizeClassType,
  normalizeAlcoholContent,
  normalizeNetContents,
  normalizeGovernmentWarning,
  normalizeBottlerName,
  normalizeBottlerAddress,
  normalizeCountryOfOrigin,
  normalizeField,
  getNormalizer,
  calculateSimilarity,
  levenshteinDistance,
} from './normalize';
