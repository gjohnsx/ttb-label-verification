/**
 * CSV Parser
 *
 * Parses and validates CSV uploads using PapaParse.
 * Handles multi-line fields, quoted content, and delimiter auto-detection.
 */

import Papa from "papaparse";
import type {
  CsvRow,
  CsvParseResult,
  CsvValidationError,
  ParsedImageUrl,
  ImageTypePrefix,
} from "./types";
import { REQUIRED_COLUMNS, MAX_UPLOAD_ROWS } from "./types";

// Valid image type prefixes
const VALID_IMAGE_TYPES: ImageTypePrefix[] = ["front", "back", "neck", "strip"];

/**
 * Parse IMAGE_URLS column value into structured array
 * Format: "front:url,back:url,neck:url"
 */
export function parseImageUrls(imageUrlsValue: string): ParsedImageUrl[] {
  if (!imageUrlsValue || imageUrlsValue.trim() === "") {
    return [];
  }

  const urls: ParsedImageUrl[] = [];
  const parts = imageUrlsValue.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const type = trimmed.substring(0, colonIndex).toLowerCase() as ImageTypePrefix;
    const url = trimmed.substring(colonIndex + 1);

    if (VALID_IMAGE_TYPES.includes(type) && url) {
      urls.push({ type, url });
    }
  }

  return urls;
}

/**
 * Validate IMAGE_URLS format for a single row
 * Returns error message if invalid, null if valid
 */
function validateImageUrls(value: string, rowIndex: number): string | null {
  if (!value || value.trim() === "") {
    return "IMAGE_URLS is required";
  }

  const parsed = parseImageUrls(value);
  if (parsed.length === 0) {
    return "IMAGE_URLS must contain at least one valid image URL in format 'type:url'";
  }

  // Validate URLs look reasonable
  for (const img of parsed) {
    try {
      new URL(img.url);
    } catch {
      return `Invalid URL format for ${img.type}: ${img.url}`;
    }
  }

  return null;
}

/**
 * Validate a single row
 * Returns array of validation errors (empty if valid)
 */
function validateRow(row: Record<string, string>, rowIndex: number): CsvValidationError[] {
  const errors: CsvValidationError[] = [];

  // Check required columns have values
  for (const col of REQUIRED_COLUMNS) {
    const value = row[col];
    if (!value || value.trim() === "") {
      errors.push({
        row: rowIndex,
        column: col,
        message: `${col} is required`,
      });
    }
  }

  // Validate IMAGE_URLS format if present
  if (row.IMAGE_URLS) {
    const imageUrlError = validateImageUrls(row.IMAGE_URLS, rowIndex);
    if (imageUrlError) {
      errors.push({
        row: rowIndex,
        column: "IMAGE_URLS",
        message: imageUrlError,
      });
    }
  }

  return errors;
}

/**
 * Parse and validate a CSV file
 */
export function parseCSV(csvContent: string): CsvParseResult {
  const errors: CsvValidationError[] = [];

  // Parse with PapaParse
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  // Check for parsing errors
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      errors.push({
        row: error.row ?? 0,
        column: "",
        message: error.message,
      });
    }
  }

  // Validate headers - check required columns exist
  const headers = result.meta.fields || [];
  for (const requiredCol of REQUIRED_COLUMNS) {
    if (!headers.includes(requiredCol)) {
      errors.push({
        row: 0,
        column: requiredCol,
        message: `Missing required column: ${requiredCol}`,
      });
    }
  }

  // If header errors, return early
  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Check row count
  if (result.data.length === 0) {
    return {
      success: false,
      errors: [
        {
          row: 0,
          column: "",
          message: "CSV contains no valid rows",
        },
      ],
    };
  }

  if (result.data.length > MAX_UPLOAD_ROWS) {
    return {
      success: false,
      errors: [
        {
          row: 0,
          column: "",
          message: `CSV exceeds maximum of ${MAX_UPLOAD_ROWS} rows (found ${result.data.length})`,
        },
      ],
    };
  }

  // Validate each row
  const validRows: CsvRow[] = [];
  const rowErrors: CsvValidationError[] = [];

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i];
    const rowValidationErrors = validateRow(row, i + 1); // 1-indexed for user display

    if (rowValidationErrors.length > 0) {
      rowErrors.push(...rowValidationErrors);
    } else {
      // Row is valid, add to valid rows
      validRows.push(row as CsvRow);
    }
  }

  // If there are row errors, include them but still allow processing of valid rows
  // For strict validation, you could return failure here instead
  if (rowErrors.length > 0 && validRows.length === 0) {
    return {
      success: false,
      errors: rowErrors,
    };
  }

  // Return valid rows (skipping invalid ones)
  // Note: The API can optionally include skipped row info in response
  return {
    success: true,
    rows: validRows,
    totalRows: validRows.length,
  };
}

/**
 * Parse CSV from a File object (for browser/API use)
 */
export async function parseCSVFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(parseCSV(content));
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: [
          {
            row: 0,
            column: "",
            message: "Failed to read file",
          },
        ],
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Extract application data from a CSV row for database insertion
 */
export function extractApplicationData(row: CsvRow) {
  const imageUrls = parseImageUrls(row.IMAGE_URLS);

  return {
    colaId: row.TTB_ID,
    brandName: row.BRAND_NAME,
    productName: row.PRODUCT_NAME || row.BRAND_NAME,
    classType: row.CLASS_NAME || "",
    productType: row.PRODUCT_TYPE || "",
    alcoholContent: row.OCR_ABV || "",
    netContents: row.OCR_VOLUME
      ? `${row.OCR_VOLUME} ${row.OCR_VOLUME_UNIT || ""}`.trim()
      : "",
    applicantName: row.APPLICANT_NAME || "",
    applicantAddress: [
      row.ADDRESS_TEXT,
      row.ADDRESS_STATE,
      row.ADDRESS_ZIP_CODE,
    ]
      .filter(Boolean)
      .join(", "),
    countryOfOrigin: row.ORIGIN_NAME || "",
    // Image URLs for creating LabelImage records
    images: imageUrls,
  };
}
