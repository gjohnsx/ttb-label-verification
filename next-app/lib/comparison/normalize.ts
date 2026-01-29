/**
 * Normalization functions for TTB label field comparison
 * Each function transforms field values to a canonical form for comparison
 */

import type { FieldType } from './types';

/**
 * Address abbreviation mappings for normalization
 */
const ADDRESS_ABBREVIATIONS: Record<string, string> = {
  'street': 'st',
  'avenue': 'ave',
  'boulevard': 'blvd',
  'drive': 'dr',
  'road': 'rd',
  'lane': 'ln',
  'court': 'ct',
  'place': 'pl',
  'circle': 'cir',
  'highway': 'hwy',
  'parkway': 'pkwy',
  'suite': 'ste',
  'apartment': 'apt',
  'building': 'bldg',
  'floor': 'fl',
  'north': 'n',
  'south': 's',
  'east': 'e',
  'west': 'w',
  'northeast': 'ne',
  'northwest': 'nw',
  'southeast': 'se',
  'southwest': 'sw',
};

/**
 * Volume unit conversions to milliliters
 */
const VOLUME_TO_ML: Record<string, number> = {
  'ml': 1,
  'milliliter': 1,
  'milliliters': 1,
  'millilitre': 1,
  'millilitres': 1,
  'cl': 10,
  'centiliter': 10,
  'centiliters': 10,
  'centilitre': 10,
  'centilitres': 10,
  'l': 1000,
  'liter': 1000,
  'liters': 1000,
  'litre': 1000,
  'litres': 1000,
  'oz': 29.5735,
  'floz': 29.5735,
  'fl oz': 29.5735,
  'fluid oz': 29.5735,
  'fluid ounce': 29.5735,
  'fluid ounces': 29.5735,
  'pt': 473.176,
  'pint': 473.176,
  'pints': 473.176,
  'qt': 946.353,
  'quart': 946.353,
  'quarts': 946.353,
  'gal': 3785.41,
  'gallon': 3785.41,
  'gallons': 3785.41,
};

/**
 * Normalize brand name for comparison
 * - Lowercase
 * - Strip apostrophes and hyphens
 * - Collapse multiple whitespace to single space
 * - Trim
 */
export function normalizeBrandName(value: string | null | undefined): string | null {
  if (!value) return null;

  return value
    .toLowerCase()
    .replace(/[''`]/g, '')  // Remove apostrophes
    .replace(/-/g, ' ')     // Replace hyphens with spaces
    .replace(/\s+/g, ' ')   // Collapse whitespace
    .trim();
}

/**
 * Normalize class/type for comparison
 * - Lowercase
 * - Trim
 */
export function normalizeClassType(value: string | null | undefined): string | null {
  if (!value) return null;

  return value.toLowerCase().trim();
}

/**
 * Normalize alcohol content for comparison
 * Handles various formats:
 * - "45%" -> "45"
 * - "45% Alc./Vol." -> "45"
 * - "45% ABV" -> "45"
 * - "90 Proof" -> "45" (proof / 2 = percentage)
 *
 * Returns the numeric alcohol percentage as a string
 */
export function normalizeAlcoholContent(value: string | null | undefined): string | null {
  if (!value) return null;

  // Normalize European decimal comma to dot
  const cleaned = value.toLowerCase().trim().replace(/,/g, ".");

  // Check for proof format first (e.g., "90 Proof")
  const proofMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*proof/i);
  if (proofMatch) {
    const proofValue = parseFloat(proofMatch[1]);
    // Convert proof to percentage (US proof = 2 * alcohol %)
    return (proofValue / 2).toString();
  }

  // Extract percentage value
  const percentMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    return parseFloat(percentMatch[1]).toString();
  }

  // Try to extract any numeric value
  const numericMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (numericMatch) {
    return parseFloat(numericMatch[1]).toString();
  }

  return null;
}

/**
 * Normalize net contents for comparison
 * Converts to milliliters for standardized comparison
 * Handles: "750 mL", "750ml", "75cl", "1L", "25.4 fl oz", etc.
 *
 * Returns the volume in milliliters as a string (rounded to nearest integer)
 */
export function normalizeNetContents(value: string | null | undefined): string | null {
  if (!value) return null;

  const cleaned = value.toLowerCase().trim();

  // Extract numeric value and unit
  const match = cleaned.match(/(\d+(?:\.\d+)?)\s*([a-z\s]+)/);
  if (!match) {
    // Try just a number (assume ml)
    const numOnly = cleaned.match(/(\d+(?:\.\d+)?)/);
    if (numOnly) {
      return Math.round(parseFloat(numOnly[1])).toString();
    }
    return null;
  }

  const numericValue = parseFloat(match[1]);
  const unit = match[2].trim().replace(/\s+/g, ' ');

  // Look up conversion factor
  const conversionFactor = VOLUME_TO_ML[unit];
  if (conversionFactor) {
    const mlValue = numericValue * conversionFactor;
    return Math.round(mlValue).toString();
  }

  // If unit not recognized, return the numeric value as-is
  return Math.round(numericValue).toString();
}

/**
 * Normalize government warning for comparison
 * EXACT match required - no normalization performed
 * Returns the original value unchanged (just trims whitespace)
 */
export function normalizeGovernmentWarning(value: string | null | undefined): string | null {
  if (!value) return null;

  // Only trim leading/trailing whitespace, preserve everything else
  return value.trim();
}

/**
 * Normalize bottler name for comparison
 * - Lowercase
 * - Trim
 * - Collapse whitespace
 */
export function normalizeBottlerName(value: string | null | undefined): string | null {
  if (!value) return null;

  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize bottler address for comparison
 * - Lowercase
 * - Normalize address abbreviations
 * - Collapse whitespace
 * - Remove punctuation (periods, commas)
 */
export function normalizeBottlerAddress(value: string | null | undefined): string | null {
  if (!value) return null;

  let normalized = value
    .toLowerCase()
    .replace(/[.,]/g, ' ')  // Remove periods and commas
    .replace(/\s+/g, ' ')   // Collapse whitespace
    .trim();

  // Replace full address words with abbreviations
  for (const [full, abbrev] of Object.entries(ADDRESS_ABBREVIATIONS)) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    normalized = normalized.replace(regex, abbrev);
  }

  // Also normalize existing abbreviations with periods (e.g., "St." -> "st")
  normalized = normalized.replace(/\./g, '').replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Normalize country of origin for comparison
 * - Lowercase
 * - Trim
 */
export function normalizeCountryOfOrigin(value: string | null | undefined): string | null {
  if (!value) return null;

  return value.toLowerCase().trim();
}

/**
 * Get the appropriate normalizer function for a field type
 */
export function getNormalizer(fieldType: FieldType): (value: string | null | undefined) => string | null {
  const normalizers: Record<FieldType, (value: string | null | undefined) => string | null> = {
    brandName: normalizeBrandName,
    classType: normalizeClassType,
    alcoholContent: normalizeAlcoholContent,
    netContents: normalizeNetContents,
    governmentWarning: normalizeGovernmentWarning,
    bottlerName: normalizeBottlerName,
    bottlerAddress: normalizeBottlerAddress,
    countryOfOrigin: normalizeCountryOfOrigin,
  };

  return normalizers[fieldType];
}

/**
 * Normalize a field value based on its type
 */
export function normalizeField(fieldType: FieldType, value: string | null | undefined): string | null {
  const normalizer = getNormalizer(fieldType);
  return normalizer(value);
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching of brand names
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create a matrix of distances
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill in the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity ratio between two strings (0-1)
 * Based on Levenshtein distance
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 && !str2) return 1;
  if (!str1 || !str2) return 0;

  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
}
