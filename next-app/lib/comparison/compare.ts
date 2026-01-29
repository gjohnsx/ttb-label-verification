/**
 * Main comparison engine for TTB label verification
 * Compares application fields against OCR-extracted values
 */

import type {
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

import {
  normalizeField,
  calculateSimilarity,
} from './normalize';

/**
 * Default fuzzy matching threshold (85% similarity)
 */
const DEFAULT_FUZZY_THRESHOLD = 0.85;

/**
 * Fields that support fuzzy matching and their thresholds
 */
const FUZZY_MATCH_FIELDS: Partial<Record<FieldType, number>> = {
  brandName: 0.85,
  classType: 0.7,
};

/**
 * Fields that require exact matching (no fuzzy)
 */
const EXACT_MATCH_FIELDS: FieldType[] = ['governmentWarning'];

/**
 * Label-only fields that don't exist on the COLA application form.
 * These are validated for presence/correctness on the label itself,
 * not compared against an Application record value.
 */
const LABEL_ONLY_FIELDS: FieldType[] = ['governmentWarning'];

/**
 * Required government warning text per TTB regulations
 */
const REQUIRED_GOVERNMENT_WARNING =
  'GOVERNMENT WARNING: (1) ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS. (2) CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY, AND MAY CAUSE HEALTH PROBLEMS.';

/**
 * All field types in comparison order
 */
const ALL_FIELDS: FieldType[] = [
  'brandName',
  'classType',
  'alcoholContent',
  'netContents',
  'governmentWarning',
  'bottlerName',
  'bottlerAddress',
  'countryOfOrigin',
];

/**
 * Determine match status based on comparison of normalized values
 */
function determineMatchStatus(
  fieldType: FieldType,
  normalizedAppValue: string | null,
  normalizedOcrValue: string | null,
  options: ComparisonOptions = {}
): { status: MatchStatus; similarityScore?: number } {
  const fuzzyThreshold =
    options.fuzzyThreshold ?? FUZZY_MATCH_FIELDS[fieldType] ?? DEFAULT_FUZZY_THRESHOLD;

  // If OCR value is missing, return MISSING
  if (normalizedOcrValue === null) {
    return { status: 'MISSING' };
  }

  // Label-only fields: validate presence/correctness on label, not against Application
  if (normalizedAppValue === null && LABEL_ONLY_FIELDS.includes(fieldType)) {
    if (fieldType === 'governmentWarning') {
      // Normalize: collapse whitespace, ensure prefix, uppercase
      const normalize = (s: string) =>
        s.replace(/\*\*/g, '').trim().toUpperCase().replace(/\s+/g, ' ');
      let ocrText = normalize(normalizedOcrValue);
      const required = normalize(REQUIRED_GOVERNMENT_WARNING);
      // LLM sometimes strips the "GOVERNMENT WARNING:" prefix
      if (!ocrText.startsWith('GOVERNMENT WARNING:')) {
        ocrText = `GOVERNMENT WARNING: ${ocrText}`;
      }
      return { status: ocrText === required ? 'MATCH' : 'MISMATCH' };
    }
    return { status: 'MATCH' };
  }

  // If application value is missing but OCR has a value
  if (normalizedAppValue === null) {
    return { status: 'MISSING' };
  }

  // Exact match check
  if (normalizedAppValue === normalizedOcrValue) {
    return { status: 'MATCH' };
  }

  // For exact match fields (like government warning), any difference is a mismatch
  if (EXACT_MATCH_FIELDS.includes(fieldType)) {
    return { status: 'MISMATCH' };
  }

  // For fuzzy match fields, check similarity
  if (FUZZY_MATCH_FIELDS[fieldType] !== undefined) {
    if (
      normalizedAppValue.includes(normalizedOcrValue) ||
      normalizedOcrValue.includes(normalizedAppValue)
    ) {
      return { status: 'LIKELY_MATCH', similarityScore: 0.9 };
    }

    const similarity = calculateSimilarity(normalizedAppValue, normalizedOcrValue);

    if (similarity >= fuzzyThreshold) {
      return { status: 'LIKELY_MATCH', similarityScore: similarity };
    }

    return { status: 'MISMATCH', similarityScore: similarity };
  }

  // For other fields, any difference after normalization is a mismatch
  return { status: 'MISMATCH' };
}

/**
 * Determine confidence level based on match status and OCR confidence
 */
function determineConfidence(
  status: MatchStatus,
  fieldType: FieldType,
  ocrConfidence?: number
): ConfidenceLevel {
  if (status === 'CONTEXT') {
    return 'LOW';
  }
  // If OCR confidence is provided and low, confidence is low
  if (ocrConfidence !== undefined && ocrConfidence < 0.7) {
    return 'LOW';
  }

  // LIKELY_MATCH always has MEDIUM confidence
  if (status === 'LIKELY_MATCH') {
    return 'MEDIUM';
  }

  // MISSING fields have LOW confidence
  if (status === 'MISSING') {
    return 'LOW';
  }

  // MISMATCH with low OCR confidence is LOW, otherwise MEDIUM
  if (status === 'MISMATCH') {
    if (ocrConfidence !== undefined && ocrConfidence < 0.85) {
      return 'LOW';
    }
    return 'MEDIUM';
  }

  // MATCH has HIGH confidence
  return 'HIGH';
}

/**
 * Compare a single field between application and OCR data
 */
function compareField(
  fieldType: FieldType,
  applicationValue: string | null | undefined,
  ocrValue: string | null | undefined,
  ocrConfidence?: number,
  options: ComparisonOptions = {},
  contextOnly = false
): FieldComparison {
  const appValue = applicationValue ?? null;
  const extractedValue = ocrValue ?? null;

  // Normalize both values
  const normalizedAppValue = normalizeField(fieldType, appValue);
  const normalizedOcrValue = normalizeField(fieldType, extractedValue);

  // Determine match status
  const { status, similarityScore } = contextOnly
    ? { status: 'CONTEXT' as MatchStatus }
    : determineMatchStatus(fieldType, normalizedAppValue, normalizedOcrValue, options);

  // Determine confidence
  const confidence = determineConfidence(status, fieldType, ocrConfidence);

  return {
    field: fieldType,
    applicationValue: appValue,
    ocrValue: extractedValue,
    normalizedAppValue,
    normalizedOcrValue,
    status,
    confidence,
    ...(similarityScore !== undefined && { similarityScore }),
  };
}

/**
 * Get a field value from application data by field type
 */
function getApplicationFieldValue(
  application: ApplicationData,
  fieldType: FieldType
): string | null | undefined {
  const fieldMap: Record<FieldType, keyof ApplicationData> = {
    brandName: 'brandName',
    classType: 'classType',
    alcoholContent: 'alcoholContent',
    netContents: 'netContents',
    governmentWarning: 'governmentWarning',
    bottlerName: 'bottlerName',
    bottlerAddress: 'bottlerAddress',
    countryOfOrigin: 'countryOfOrigin',
  };

  const key = fieldMap[fieldType];
  return application[key] as string | null | undefined;
}

/**
 * Get a field value from OCR extracted fields by field type
 */
function getOcrFieldValue(
  ocrFields: ExtractedFields,
  fieldType: FieldType
): string | null | undefined {
  switch (fieldType) {
    case 'brandName':
      return ocrFields.brandName;
    case 'classType':
      return ocrFields.classType;
    case 'alcoholContent':
      return ocrFields.alcoholContent;
    case 'netContents':
      return ocrFields.netContents;
    case 'governmentWarning':
      return ocrFields.governmentWarning;
    case 'bottlerName':
      return ocrFields.bottlerName;
    case 'bottlerAddress':
      return ocrFields.bottlerAddress;
    case 'countryOfOrigin':
      return ocrFields.countryOfOrigin;
    default:
      return undefined;
  }
}

/**
 * Determine overall comparison status based on field results
 */
function determineOverallStatus(fields: FieldComparison[]): OverallStatus {
  const hasMismatch = fields.some(f => f.status === 'MISMATCH');
  const hasLikelyMatch = fields.some(f => f.status === 'LIKELY_MATCH');
  const hasMissing = fields.some(f => f.status === 'MISSING');

  if (hasMismatch) {
    return 'MISMATCH';
  }

  if (hasLikelyMatch || hasMissing) {
    return 'NEEDS_REVIEW';
  }

  return 'MATCH';
}

/**
 * Main comparison function
 * Compares application data against OCR-extracted fields
 */
export function compareApplication(
  application: ApplicationData,
  ocrFields: ExtractedFields,
  options: ComparisonOptions = {}
): ComparisonResult {
  const skipFields = options.skipFields ?? [];
  const includeOcrConfidence = options.includeOcrConfidence ?? true;
  const contextOnlyFields = [...(options.contextOnlyFields ?? [])];

  if (application.sourceType?.toLowerCase() === 'imported') {
    contextOnlyFields.push('bottlerName', 'bottlerAddress');
  }

  // Compare all fields
  const fields: FieldComparison[] = [];

  for (const fieldType of ALL_FIELDS) {
    // Skip fields if configured
    if (skipFields.includes(fieldType)) {
      continue;
    }

    const applicationValue = getApplicationFieldValue(application, fieldType);
    const ocrValue = getOcrFieldValue(ocrFields, fieldType);

    // Get OCR confidence if available and configured
    const ocrConfidence = includeOcrConfidence
      ? ocrFields.confidenceScores?.[fieldType]
      : undefined;

    const comparison = compareField(
      fieldType,
      applicationValue,
      ocrValue,
      ocrConfidence,
      options,
      contextOnlyFields.includes(fieldType)
    );

    fields.push(comparison);
  }

  // Calculate counts
  const relevantFields = fields.filter((f) => f.status !== 'CONTEXT');
  const matchCount = relevantFields.filter((f) => f.status === 'MATCH').length;
  const mismatchCount = relevantFields.filter((f) => f.status === 'MISMATCH').length;
  const missingCount = relevantFields.filter(
    (f) => f.status === 'MISSING' && f.applicationValue
  ).length;
  const likelyMatchCount = relevantFields.filter(
    (f) => f.status === 'LIKELY_MATCH'
  ).length;

  // Determine overall status
  const overallStatus = determineOverallStatus(relevantFields);

  return {
    applicationId: application.id,
    fields,
    overallStatus,
    matchCount,
    mismatchCount,
    missingCount,
    likelyMatchCount,
    comparedAt: new Date(),
  };
}

/**
 * Compare multiple applications in batch
 */
export function compareApplications(
  applications: ApplicationData[],
  ocrFieldsByAppId: Map<string, ExtractedFields>,
  options: ComparisonOptions = {}
): ComparisonResult[] {
  return applications.map(application => {
    const ocrFields = ocrFieldsByAppId.get(application.id) ?? {};
    return compareApplication(application, ocrFields, options);
  });
}

/**
 * Quick comparison that returns just the overall status
 * Useful for list views or quick checks
 */
export function quickCompare(
  application: ApplicationData,
  ocrFields: ExtractedFields
): OverallStatus {
  const result = compareApplication(application, ocrFields);
  return result.overallStatus;
}

/**
 * Check if a specific field matches between application and OCR data
 */
export function fieldMatches(
  fieldType: FieldType,
  applicationValue: string | null | undefined,
  ocrValue: string | null | undefined,
  options: ComparisonOptions = {}
): boolean {
  const comparison = compareField(fieldType, applicationValue, ocrValue, undefined, options);
  return (
    comparison.status === 'MATCH' ||
    comparison.status === 'LIKELY_MATCH' ||
    comparison.status === 'CONTEXT'
  );
}

// Re-export types for convenience
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
