/**
 * Sample Data Generator for CSV Upload Demo
 *
 * Generates 30 sample applications for demo purposes:
 * - 18 clean matches (60%)
 * - 4 government warning issues (13%)
 * - 4 brand/ABV mismatches (13%)
 * - 4 OCR challenges (13%)
 */

import type { CsvRow, ImageTypePrefix } from "./types";

// Azure blob storage base URL for demo images
const DEMO_BLOB_BASE =
  process.env.AZURE_DEMO_BLOB_URL ||
  "https://ttblabels.blob.core.windows.net/demo";

// Exact federal government warning text from 27 CFR 16.21
const GOVERNMENT_WARNING =
  "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

// Helper to generate IMAGE_URLS column value
function formatImageUrls(
  ttbId: string,
  images: ImageTypePrefix[]
): string {
  return images
    .map((type) => `${type}:${DEMO_BLOB_BASE}/${ttbId}-${type}.jpg`)
    .join(",");
}

// Helper to generate TTB ID in realistic format
function generateTtbId(index: number): string {
  const year = "24";
  const sequence = String(index).padStart(10, "0");
  const suffix = "001";
  return `${year}${sequence}${suffix}`;
}

interface SampleApplication {
  ttbId: string;
  brandName: string;
  className: string;
  productType: string;
  abv: string;
  volume: string;
  volumeUnit: string;
  applicantName: string;
  addressText: string;
  addressState: string;
  addressZip: string;
  origin: string;
  images: ImageTypePrefix[];
  category: "clean" | "warning" | "mismatch" | "ocr_challenge";
}

// Sample applications data
const sampleApplications: SampleApplication[] = [
  // ============================================================================
  // CLEAN MATCHES (18 applications) - 60%
  // ============================================================================
  {
    ttbId: generateTtbId(1),
    brandName: "Stone's Throw Whiskey",
    className: "Whiskey",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Stone's Throw Distillery, LLC",
    addressText: "123 Distillery Lane",
    addressState: "KY",
    addressZip: "40202",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(2),
    brandName: "Blue Mountain Vodka",
    className: "Vodka",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "1",
    volumeUnit: "L",
    applicantName: "Blue Mountain Spirits Co.",
    addressText: "456 Alpine Way",
    addressState: "CO",
    addressZip: "80202",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(3),
    brandName: "Sunset Valley Chardonnay",
    className: "Table Wine",
    productType: "WINE",
    abv: "13.5",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Sunset Valley Vineyards",
    addressText: "789 Vineyard Road",
    addressState: "CA",
    addressZip: "94558",
    origin: "USA",
    images: ["front", "back"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(4),
    brandName: "Golden Harvest Lager",
    className: "Beer",
    productType: "MALT BEVERAGE",
    abv: "5.0",
    volume: "12",
    volumeUnit: "FL OZ",
    applicantName: "Golden Harvest Brewing Company",
    addressText: "321 Brewery Street",
    addressState: "WI",
    addressZip: "53202",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(5),
    brandName: "Old Heritage Bourbon",
    className: "Bourbon Whiskey",
    productType: "DISTILLED SPIRITS",
    abv: "45",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Heritage Distillers",
    addressText: "888 Oak Barrel Lane",
    addressState: "KY",
    addressZip: "40004",
    origin: "USA",
    images: ["front", "back"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(6),
    brandName: "Botanical Garden Gin",
    className: "Gin",
    productType: "DISTILLED SPIRITS",
    abv: "47",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Garden Spirits Distillery",
    addressText: "202 Juniper Street",
    addressState: "OR",
    addressZip: "97201",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(7),
    brandName: "Caribbean Sun Rum",
    className: "Rum",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Caribbean Sun Distillers",
    addressText: "100 Palm Tree Ave",
    addressState: "FL",
    addressZip: "33101",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(8),
    brandName: "Valley Oak Brandy",
    className: "Brandy",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Valley Oak Distillery",
    addressText: "789 Orchard Road",
    addressState: "CA",
    addressZip: "93650",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(9),
    brandName: "Coastal Breeze Hard Seltzer",
    className: "Malt Beverage",
    productType: "MALT BEVERAGE",
    abv: "5.0",
    volume: "12",
    volumeUnit: "FL OZ",
    applicantName: "Coastal Beverages, Inc.",
    addressText: "555 Beach Boulevard",
    addressState: "CA",
    addressZip: "92101",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(10),
    brandName: "Twin Peaks Cabernet",
    className: "Table Wine",
    productType: "WINE",
    abv: "13.9",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Twin Peaks Winery",
    addressText: "Twin Peaks Road",
    addressState: "CA",
    addressZip: "93446",
    origin: "USA",
    images: ["front", "back"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(11),
    brandName: "Reserve Collection Whiskey",
    className: "Whiskey",
    productType: "DISTILLED SPIRITS",
    abv: "43",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Reserve Collection Distillers",
    addressText: "100 Reserve Drive",
    addressState: "TN",
    addressZip: "37201",
    origin: "USA",
    images: ["front", "back", "neck"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(12),
    brandName: "Agave Gold Tequila",
    className: "Tequila",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Agave Gold Imports, LLC",
    addressText: "450 Southwest Plaza",
    addressState: "AZ",
    addressZip: "85001",
    origin: "Mexico",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(13),
    brandName: "Mountain Peak Vodka",
    className: "Vodka",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Mountain Peak Distilling",
    addressText: "100 Summit Ave",
    addressState: "CO",
    addressZip: "80301",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(14),
    brandName: "Cedar Ridge Whiskey",
    className: "Whiskey",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Cedar Ridge Distillery",
    addressText: "200 Oak Street",
    addressState: "IA",
    addressZip: "50301",
    origin: "USA",
    images: ["front", "back"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(15),
    brandName: "River Bend Gin",
    className: "Gin",
    productType: "DISTILLED SPIRITS",
    abv: "45",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "River Bend Spirits",
    addressText: "300 River Road",
    addressState: "VA",
    addressZip: "23219",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(16),
    brandName: "Highland Single Malt",
    className: "Whisky",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "1",
    volumeUnit: "L",
    applicantName: "Highland Spirits Ltd.",
    addressText: "400 Glen Road",
    addressState: "NY",
    addressZip: "10001",
    origin: "Scotland",
    images: ["front", "back"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(17),
    brandName: "Pacific Coast Pinot Noir",
    className: "Table Wine",
    productType: "WINE",
    abv: "14.2",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Pacific Coast Vineyards",
    addressText: "Coast Highway 1",
    addressState: "CA",
    addressZip: "93101",
    origin: "USA",
    images: ["front", "back"],
    category: "clean",
  },
  {
    ttbId: generateTtbId(18),
    brandName: "Amber Waves IPA",
    className: "Beer",
    productType: "MALT BEVERAGE",
    abv: "6.5",
    volume: "16",
    volumeUnit: "FL OZ",
    applicantName: "Amber Waves Brewing Co.",
    addressText: "1500 Hop Street",
    addressState: "WA",
    addressZip: "98101",
    origin: "USA",
    images: ["front"],
    category: "clean",
  },

  // ============================================================================
  // GOVERNMENT WARNING ISSUES (4 applications) - 13%
  // ============================================================================
  {
    ttbId: generateTtbId(19),
    brandName: "Desert Bloom Wine",
    className: "Table Wine",
    productType: "WINE",
    abv: "12.5",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Desert Bloom Vineyards",
    addressText: "900 Desert Road",
    addressState: "AZ",
    addressZip: "85701",
    origin: "USA",
    images: ["front"],
    category: "warning",
  },
  {
    ttbId: generateTtbId(20),
    brandName: "North Star Whiskey",
    className: "Whiskey",
    productType: "DISTILLED SPIRITS",
    abv: "43",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "North Star Distillers",
    addressText: "1000 North Road",
    addressState: "MN",
    addressZip: "55401",
    origin: "USA",
    images: ["front", "back"],
    category: "warning",
  },
  {
    ttbId: generateTtbId(21),
    brandName: "Amber Ridge Rum",
    className: "Rum",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Amber Ridge Distillers",
    addressText: "1100 Harbor Drive",
    addressState: "FL",
    addressZip: "33602",
    origin: "USA",
    images: ["front"],
    category: "warning",
  },
  {
    ttbId: generateTtbId(22),
    brandName: "Prairie Sun Vodka",
    className: "Vodka",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Prairie Sun Spirits",
    addressText: "200 Wheat Field Road",
    addressState: "KS",
    addressZip: "67202",
    origin: "USA",
    images: ["front"],
    category: "warning",
  },

  // ============================================================================
  // BRAND/ABV MISMATCHES (4 applications) - 13%
  // ============================================================================
  {
    ttbId: generateTtbId(23),
    brandName: "Sunset Ridge Bourbon",
    className: "Bourbon Whiskey",
    productType: "DISTILLED SPIRITS",
    abv: "42",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Sunset Ridge Distillery",
    addressText: "500 Bourbon Lane",
    addressState: "KY",
    addressZip: "40507",
    origin: "USA",
    images: ["front"],
    category: "mismatch",
  },
  {
    ttbId: generateTtbId(24),
    brandName: "Silver Lake Vodka",
    className: "Vodka",
    productType: "DISTILLED SPIRITS",
    abv: "40",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Silver Lake Spirits",
    addressText: "600 Lake Drive",
    addressState: "IL",
    addressZip: "60601",
    origin: "USA",
    images: ["front"],
    category: "mismatch",
  },
  {
    ttbId: generateTtbId(25),
    brandName: "Prairie Wind Beer",
    className: "Beer",
    productType: "MALT BEVERAGE",
    abv: "5.5",
    volume: "12",
    volumeUnit: "FL OZ",
    applicantName: "Prairie Wind Brewing",
    addressText: "700 Prairie Road",
    addressState: "KS",
    addressZip: "67202",
    origin: "USA",
    images: ["front"],
    category: "mismatch",
  },
  {
    ttbId: generateTtbId(26),
    brandName: "Forest Glen Gin",
    className: "Gin",
    productType: "DISTILLED SPIRITS",
    abv: "42",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Forest Glen Distillery",
    addressText: "800 Pine Lane",
    addressState: "WA",
    addressZip: "98101",
    origin: "USA",
    images: ["front"],
    category: "mismatch",
  },

  // ============================================================================
  // OCR CHALLENGES (4 applications) - 13%
  // ============================================================================
  {
    ttbId: generateTtbId(27),
    brandName: "Vintage Reserve Whiskey",
    className: "Whiskey",
    productType: "DISTILLED SPIRITS",
    abv: "45",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Artisan Spirits Co.",
    addressText: "321 Craft Lane",
    addressState: "OR",
    addressZip: "97201",
    origin: "USA",
    images: ["front"],
    category: "ocr_challenge",
  },
  {
    ttbId: generateTtbId(28),
    brandName: "Barrel Select Bourbon",
    className: "Bourbon Whiskey",
    productType: "DISTILLED SPIRITS",
    abv: "46",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Barrel Select Distillery",
    addressText: "654 Cooperage Road",
    addressState: "KY",
    addressZip: "40601",
    origin: "USA",
    images: ["front", "back"],
    category: "ocr_challenge",
  },
  {
    ttbId: generateTtbId(29),
    brandName: "Handcrafted Small Batch",
    className: "Whiskey",
    productType: "DISTILLED SPIRITS",
    abv: "47",
    volume: "375",
    volumeUnit: "mL",
    applicantName: "Small Batch Distillers",
    addressText: "111 Artisan Way",
    addressState: "TN",
    addressZip: "37201",
    origin: "USA",
    images: ["front"],
    category: "ocr_challenge",
  },
  {
    ttbId: generateTtbId(30),
    brandName: "Estate Bottled Cabernet",
    className: "Table Wine",
    productType: "WINE",
    abv: "14.5",
    volume: "750",
    volumeUnit: "mL",
    applicantName: "Estate Vineyards",
    addressText: "2000 Estate Road",
    addressState: "CA",
    addressZip: "95476",
    origin: "USA",
    images: ["front", "back"],
    category: "ocr_challenge",
  },
];

/**
 * Convert a sample application to a CSV row
 */
function toCSVRow(app: SampleApplication): CsvRow {
  const today = new Date();
  const applicationDate = new Date(today);
  applicationDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
  const approvalDate = new Date(applicationDate);
  approvalDate.setDate(applicationDate.getDate() + 5);

  return {
    TTB_ID: app.ttbId,
    APPLICATION_TYPE: "LABEL",
    APPLICATION_STATUS: "APPROVED",
    IS_DISTINCTIVE_CONTAINER: "FALSE",
    FOR_DISTINCTIVE_CAPACITY: "",
    IS_RESUBMISSION: "FALSE",
    FOR_RESUBMISSION_TTB_ID: "",
    FOR_EXEMPTION_STATE: "",
    APPROVAL_QUALIFICATIONS: "",
    OFF_LABEL_INFORMATION: "",
    IS_FORM_PHYSICAL: "FALSE",
    FORM_IMAGE_S3_KEY: "",
    APPLICATION_DATE: applicationDate.toISOString().split("T")[0],
    APPROVAL_DATE: approvalDate.toISOString().split("T")[0],
    EXPIRATION_DATE: "",
    LATEST_UPDATE_DATE: approvalDate.toISOString().split("T")[0],
    PRODUCT_NAME: app.brandName,
    BRAND_NAME: app.brandName,
    PERMIT_NUMBER: `TX-I-${Math.floor(Math.random() * 90000) + 10000}`,
    ORIGIN_ID: app.origin === "USA" ? "1" : "2",
    ORIGIN_NAME: app.origin,
    CLASS_ID: "1",
    CLASS_NAME: app.className,
    PRODUCT_TYPE: app.productType,
    DOMESTIC_OR_IMPORTED: app.origin === "USA" ? "DOMESTIC" : "IMPORTED",
    GRAPE_VARIETALS: app.productType === "WINE" ? app.brandName.split(" ").pop() : "",
    WINE_VINTAGE_YEAR: app.productType === "WINE" ? "2022" : "",
    WINE_APPELLATION: app.productType === "WINE" ? app.addressState : "",
    FORMULA_CODE: "",
    APPLICANT_NAME: app.applicantName,
    ADDRESS_TEXT: app.addressText,
    ADDRESS_RECIPIENT: app.applicantName,
    ADDRESS_ZIP_CODE: app.addressZip,
    ADDRESS_STATE: app.addressState,
    OCR_ABV: `${app.abv}%`,
    OCR_ABV_TTB_IMAGE_ID: "",
    OCR_VOLUME: app.volume,
    OCR_VOLUME_UNIT: app.volumeUnit,
    OCR_VOLUME_TTB_IMAGE_ID: "",
    MAIN_TTB_IMAGE_ID: app.ttbId,
    MAIN_IMAGE_S3_KEY: "",
    IMAGE_COUNT: String(app.images.length),
    IMAGE_COUNT_BROKEN: "0",
    HAS_FRONT_IMAGE: app.images.includes("front") ? "TRUE" : "FALSE",
    HAS_BACK_IMAGE: app.images.includes("back") ? "TRUE" : "FALSE",
    HAS_NECK_IMAGE: app.images.includes("neck") ? "TRUE" : "FALSE",
    HAS_STRIP_IMAGE: app.images.includes("strip") ? "TRUE" : "FALSE",
    BARCODE_TYPE: "",
    BARCODE_VALUE: "",
    TTB_IMAGE_BARCODE_ID: "",
    QRCODE_URL: "",
    LLM_CONTAINER_TYPE: "bottle",
    LLM_PRODUCT_DESCRIPTION: `${app.brandName} - A quality ${app.className.toLowerCase()} product`,
    LLM_TASTING_NOTES: "",
    LLM_BRAND_ESTABLISHED_YEAR: "",
    LLM_CATEGORY: app.productType,
    LLM_CATEGORY_PATH: `${app.productType} > ${app.className}`,
    LLM_TASTING_NOTE_FLAVORS: "",
    LLM_ARTWORK_CREDIT: "",
    LLM_WINE_DESIGNATION: "",
    LLM_BEER_IBU: app.productType === "MALT BEVERAGE" ? "35" : "",
    LLM_BEER_HOPS_VARIETIES: "",
    LLM_LIQUOR_AGED_YEARS: "",
    LLM_LIQUOR_FINISHING_PROCESS: "",
    LLM_LIQUOR_GRAINS: "",
    IMAGE_URLS: formatImageUrls(app.ttbId, app.images),
  };
}

/**
 * Get all sample applications as CSV rows
 */
export function getSampleApplications(): CsvRow[] {
  return sampleApplications.map(toCSVRow);
}

/**
 * Get the full list of CSV column headers in the correct order
 */
export function getCsvHeaders(): string[] {
  return [
    "TTB_ID",
    "APPLICATION_TYPE",
    "APPLICATION_STATUS",
    "IS_DISTINCTIVE_CONTAINER",
    "FOR_DISTINCTIVE_CAPACITY",
    "IS_RESUBMISSION",
    "FOR_RESUBMISSION_TTB_ID",
    "FOR_EXEMPTION_STATE",
    "APPROVAL_QUALIFICATIONS",
    "OFF_LABEL_INFORMATION",
    "IS_FORM_PHYSICAL",
    "FORM_IMAGE_S3_KEY",
    "APPLICATION_DATE",
    "APPROVAL_DATE",
    "EXPIRATION_DATE",
    "LATEST_UPDATE_DATE",
    "PRODUCT_NAME",
    "BRAND_NAME",
    "PERMIT_NUMBER",
    "ORIGIN_ID",
    "ORIGIN_NAME",
    "CLASS_ID",
    "CLASS_NAME",
    "PRODUCT_TYPE",
    "DOMESTIC_OR_IMPORTED",
    "GRAPE_VARIETALS",
    "WINE_VINTAGE_YEAR",
    "WINE_APPELLATION",
    "FORMULA_CODE",
    "APPLICANT_NAME",
    "ADDRESS_TEXT",
    "ADDRESS_RECIPIENT",
    "ADDRESS_ZIP_CODE",
    "ADDRESS_STATE",
    "OCR_ABV",
    "OCR_ABV_TTB_IMAGE_ID",
    "OCR_VOLUME",
    "OCR_VOLUME_UNIT",
    "OCR_VOLUME_TTB_IMAGE_ID",
    "MAIN_TTB_IMAGE_ID",
    "MAIN_IMAGE_S3_KEY",
    "IMAGE_COUNT",
    "IMAGE_COUNT_BROKEN",
    "HAS_FRONT_IMAGE",
    "HAS_BACK_IMAGE",
    "HAS_NECK_IMAGE",
    "HAS_STRIP_IMAGE",
    "BARCODE_TYPE",
    "BARCODE_VALUE",
    "TTB_IMAGE_BARCODE_ID",
    "QRCODE_URL",
    "LLM_CONTAINER_TYPE",
    "LLM_PRODUCT_DESCRIPTION",
    "LLM_TASTING_NOTES",
    "LLM_BRAND_ESTABLISHED_YEAR",
    "LLM_CATEGORY",
    "LLM_CATEGORY_PATH",
    "LLM_TASTING_NOTE_FLAVORS",
    "LLM_ARTWORK_CREDIT",
    "LLM_WINE_DESIGNATION",
    "LLM_BEER_IBU",
    "LLM_BEER_HOPS_VARIETIES",
    "LLM_LIQUOR_AGED_YEARS",
    "LLM_LIQUOR_FINISHING_PROCESS",
    "LLM_LIQUOR_GRAINS",
    "IMAGE_URLS",
  ];
}

/**
 * Escape a CSV field value (handle commas, quotes, newlines)
 */
function escapeCSVField(value: string | undefined): string {
  if (!value) return "";
  // If the value contains comma, quote, or newline, wrap in quotes and escape inner quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate the complete sample CSV as a string
 */
export function generateSampleCsv(): string {
  const headers = getCsvHeaders();
  const rows = getSampleApplications();

  const headerLine = headers.join(",");
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCSVField(row[header])).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

/**
 * Get summary of sample data breakdown
 */
export function getSampleDataSummary(): {
  total: number;
  clean: number;
  warning: number;
  mismatch: number;
  ocrChallenge: number;
} {
  return {
    total: sampleApplications.length,
    clean: sampleApplications.filter((a) => a.category === "clean").length,
    warning: sampleApplications.filter((a) => a.category === "warning").length,
    mismatch: sampleApplications.filter((a) => a.category === "mismatch").length,
    ocrChallenge: sampleApplications.filter((a) => a.category === "ocr_challenge")
      .length,
  };
}
