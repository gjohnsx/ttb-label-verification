/**
 * CSV Upload Types
 *
 * Types for parsing and validating CSV uploads that mock COLA system exports.
 * The CSV format mirrors the colas_2018.csv dataset structure plus IMAGE_URLS.
 */

// Image type prefixes used in IMAGE_URLS column
export type ImageTypePrefix = "front" | "back" | "neck" | "strip";

// Parsed image URL with type
export interface ParsedImageUrl {
  type: ImageTypePrefix;
  url: string;
}

// CSV validation error for a specific row/column
export interface CsvValidationError {
  row: number;
  column: string;
  message: string;
}

// Result of CSV parsing - either success or failure
export type CsvParseResult =
  | {
      success: true;
      rows: CsvRow[];
      totalRows: number;
    }
  | {
      success: false;
      errors: CsvValidationError[];
    };

// All columns from the CSV (matching colas_2018.csv structure + IMAGE_URLS)
export interface CsvRow {
  // Required columns
  TTB_ID: string;
  BRAND_NAME: string;
  IMAGE_URLS: string;

  // Optional columns (may be empty but must exist in header)
  APPLICATION_TYPE?: string;
  APPLICATION_STATUS?: string;
  IS_DISTINCTIVE_CONTAINER?: string;
  FOR_DISTINCTIVE_CAPACITY?: string;
  IS_RESUBMISSION?: string;
  FOR_RESUBMISSION_TTB_ID?: string;
  FOR_EXEMPTION_STATE?: string;
  APPROVAL_QUALIFICATIONS?: string;
  OFF_LABEL_INFORMATION?: string;
  IS_FORM_PHYSICAL?: string;
  FORM_IMAGE_S3_KEY?: string;
  APPLICATION_DATE?: string;
  APPROVAL_DATE?: string;
  EXPIRATION_DATE?: string;
  LATEST_UPDATE_DATE?: string;
  PRODUCT_NAME?: string;
  PERMIT_NUMBER?: string;
  ORIGIN_ID?: string;
  ORIGIN_NAME?: string;
  CLASS_ID?: string;
  CLASS_NAME?: string;
  PRODUCT_TYPE?: string;
  DOMESTIC_OR_IMPORTED?: string;
  GRAPE_VARIETALS?: string;
  WINE_VINTAGE_YEAR?: string;
  WINE_APPELLATION?: string;
  FORMULA_CODE?: string;
  APPLICANT_NAME?: string;
  ADDRESS_TEXT?: string;
  ADDRESS_RECIPIENT?: string;
  ADDRESS_ZIP_CODE?: string;
  ADDRESS_STATE?: string;
  OCR_ABV?: string;
  OCR_ABV_TTB_IMAGE_ID?: string;
  OCR_VOLUME?: string;
  OCR_VOLUME_UNIT?: string;
  OCR_VOLUME_TTB_IMAGE_ID?: string;
  MAIN_TTB_IMAGE_ID?: string;
  MAIN_IMAGE_S3_KEY?: string;
  IMAGE_COUNT?: string;
  IMAGE_COUNT_BROKEN?: string;
  HAS_FRONT_IMAGE?: string;
  HAS_BACK_IMAGE?: string;
  HAS_NECK_IMAGE?: string;
  HAS_STRIP_IMAGE?: string;
  BARCODE_TYPE?: string;
  BARCODE_VALUE?: string;
  TTB_IMAGE_BARCODE_ID?: string;
  QRCODE_URL?: string;
  LLM_CONTAINER_TYPE?: string;
  LLM_PRODUCT_DESCRIPTION?: string;
  LLM_TASTING_NOTES?: string;
  LLM_BRAND_ESTABLISHED_YEAR?: string;
  LLM_CATEGORY?: string;
  LLM_CATEGORY_PATH?: string;
  LLM_TASTING_NOTE_FLAVORS?: string;
  LLM_ARTWORK_CREDIT?: string;
  LLM_WINE_DESIGNATION?: string;
  LLM_BEER_IBU?: string;
  LLM_BEER_HOPS_VARIETIES?: string;
  LLM_LIQUOR_AGED_YEARS?: string;
  LLM_LIQUOR_FINISHING_PROCESS?: string;
  LLM_LIQUOR_GRAINS?: string;

  // Allow additional columns to be preserved
  [key: string]: string | undefined;
}

// Required columns that must exist and have values
export const REQUIRED_COLUMNS = ["TTB_ID", "BRAND_NAME", "IMAGE_URLS"] as const;

// Maximum rows allowed per upload
export const MAX_UPLOAD_ROWS = 500;

// Progress update sent via SSE during workflow processing
export interface ProgressUpdate {
  applicationId: string;
  brandName: string;
  status: "QUEUED" | "PROCESSING" | "READY" | "NEEDS_ATTENTION" | "ERROR" | "SKIPPED";
  index: number;
  total: number;
  error?: string;
}

// Response from POST /api/upload/csv
export interface CsvUploadResponse {
  success: boolean;
  runId?: string;
  totalRows?: number;
  error?: string;
  errors?: CsvValidationError[];
}

// Summary data for upload results
export interface UploadSummary {
  runId: string;
  totalRows: number;
  readyCount: number;
  needsAttentionCount: number;
  errorCount: number;
}
