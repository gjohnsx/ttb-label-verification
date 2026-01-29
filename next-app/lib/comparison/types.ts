/**
 * Field comparison types for TTB label verification
 */

/**
 * Field types that can be compared between application data and OCR-extracted values
 */
export type FieldType =
  | 'brandName'
  | 'classType'
  | 'alcoholContent'
  | 'netContents'
  | 'governmentWarning'
  | 'bottlerName'
  | 'bottlerAddress'
  | 'countryOfOrigin';

/**
 * Match status for a field comparison
 */
export type MatchStatus =
  | 'MATCH'
  | 'LIKELY_MATCH'
  | 'MISMATCH'
  | 'MISSING'
  | 'CONTEXT';

/**
 * Confidence level for a field comparison result
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Overall status of an application comparison
 */
export type OverallStatus = 'MATCH' | 'NEEDS_REVIEW' | 'MISMATCH';

/**
 * Result of comparing a single field
 */
export interface FieldComparison {
  /** The type of field being compared */
  field: FieldType;
  /** Original value from the application */
  applicationValue: string | null;
  /** Value extracted via OCR */
  ocrValue: string | null;
  /** Normalized application value used for comparison */
  normalizedAppValue: string | null;
  /** Normalized OCR value used for comparison */
  normalizedOcrValue: string | null;
  /** Result of the comparison */
  status: MatchStatus;
  /** Confidence in the comparison result */
  confidence: ConfidenceLevel;
  /** Optional similarity score (0-1) for fuzzy matches */
  similarityScore?: number;
}

/**
 * Complete result of comparing an application against OCR-extracted data
 */
export interface ComparisonResult {
  /** Unique identifier for the application */
  applicationId: string;
  /** Individual field comparison results */
  fields: FieldComparison[];
  /** Overall status of the comparison */
  overallStatus: OverallStatus;
  /** Count of fields that matched */
  matchCount: number;
  /** Count of fields that mismatched */
  mismatchCount: number;
  /** Count of fields missing from OCR */
  missingCount: number;
  /** Count of fields needing review (LIKELY_MATCH) */
  likelyMatchCount: number;
  /** Timestamp when comparison was performed */
  comparedAt: Date;
}

/**
 * Application data structure for comparison
 */
export interface ApplicationData {
  /** Unique identifier for the application */
  id: string;
  /** Product type from application (e.g., "WINE", "DISTILLED SPIRITS") */
  productType?: string | null;
  /** Source type (Domestic/Imported) */
  sourceType?: string | null;
  /** Brand name of the product */
  brandName?: string | null;
  /** Class/Type of beverage (e.g., "Whiskey", "Vodka") */
  classType?: string | null;
  /** Alcohol content (e.g., "40%", "80 Proof") */
  alcoholContent?: string | null;
  /** Net contents (e.g., "750 mL", "1L") */
  netContents?: string | null;
  /** Government warning text */
  governmentWarning?: string | null;
  /** Bottler/Producer name */
  bottlerName?: string | null;
  /** Bottler/Producer address */
  bottlerAddress?: string | null;
  /** Country of origin */
  countryOfOrigin?: string | null;
}

/**
 * OCR-extracted fields from a label image
 */
export interface ExtractedFields {
  /** Brand name extracted from label */
  brandName?: string | null;
  /** Class/Type extracted from label */
  classType?: string | null;
  /** Alcohol content extracted from label */
  alcoholContent?: string | null;
  /** Net contents extracted from label */
  netContents?: string | null;
  /** Government warning extracted from label */
  governmentWarning?: string | null;
  /** Bottler name extracted from label */
  bottlerName?: string | null;
  /** Bottler address extracted from label */
  bottlerAddress?: string | null;
  /** Country of origin extracted from label */
  countryOfOrigin?: string | null;
  /** Confidence scores for each extracted field (0-1) */
  confidenceScores?: Partial<Record<FieldType, number>>;
}

/**
 * Configuration options for the comparison engine
 */
export interface ComparisonOptions {
  /** Similarity threshold for fuzzy matching (0-1, default 0.85) */
  fuzzyThreshold?: number;
  /** Fields to skip during comparison */
  skipFields?: FieldType[];
  /** Fields to treat as context-only (do not affect matching) */
  contextOnlyFields?: FieldType[];
  /** Whether to include confidence scores from OCR in results */
  includeOcrConfidence?: boolean;
}
