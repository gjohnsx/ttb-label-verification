/**
 * Seed data for TTB Label Verification app
 */

// Exact federal government warning text from 27 CFR 16.21
export const GOVERNMENT_WARNING =
  "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

// Application status values
export type ApplicationStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "NEEDS_ATTENTION"
  | "REVIEWED"
  | "ERROR";

// Image type values
export type ImageType = "FRONT" | "BACK" | "NECK";

export interface ApplicationData {
  colaId: string;
  brandName: string;
  classType: string;
  alcoholContent: string;
  netContents: string;
  governmentWarning: string;
  bottlerName: string;
  bottlerAddress: string;
  countryOfOrigin: string;
  status: ApplicationStatus;
  images: { imageType: ImageType }[];
  // For documentation purposes
  _testCategory?: string;
  _testDescription?: string;
}

// Generate a COLA ID in realistic format (e.g., "24001234567001")
function generateColaId(index: number): string {
  const year = "24";
  const sequence = String(index + 1).padStart(10, "0");
  const suffix = "001";
  return `${year}${sequence}${suffix}`;
}

// ============================================================================
// TEST DATA DEFINITIONS
// ============================================================================

export const applications: ApplicationData[] = [
  // ============================================================================
  // CATEGORY 1: Clean Matches (10 applications)
  // All fields match perfectly - should result in automatic approval
  // ============================================================================
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect whiskey match",
    colaId: generateColaId(1),
    brandName: "Stone's Throw Whiskey",
    classType: "Whiskey",
    alcoholContent: "40% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Stone's Throw Distillery, LLC",
    bottlerAddress: "123 Distillery Lane, Louisville, KY 40202",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect vodka match",
    colaId: generateColaId(2),
    brandName: "Blue Mountain Vodka",
    classType: "Vodka",
    alcoholContent: "40% Alc./Vol.",
    netContents: "1 L",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Blue Mountain Spirits Co.",
    bottlerAddress: "456 Alpine Way, Denver, CO 80202",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect wine match",
    colaId: generateColaId(3),
    brandName: "Sunset Valley Chardonnay",
    classType: "Wine",
    alcoholContent: "13.5% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Sunset Valley Vineyards",
    bottlerAddress: "789 Vineyard Road, Napa, CA 94558",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect beer match",
    colaId: generateColaId(4),
    brandName: "Golden Harvest Lager",
    classType: "Beer",
    alcoholContent: "5.0% Alc./Vol.",
    netContents: "12 FL OZ",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Golden Harvest Brewing Company",
    bottlerAddress: "321 Brewery Street, Milwaukee, WI 53202",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect malt beverage match",
    colaId: generateColaId(5),
    brandName: "Coastal Breeze Hard Seltzer",
    classType: "Malt Beverage",
    alcoholContent: "5.0% Alc./Vol.",
    netContents: "12 FL OZ",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Coastal Beverages, Inc.",
    bottlerAddress: "555 Beach Boulevard, San Diego, CA 92101",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect bourbon match",
    colaId: generateColaId(6),
    brandName: "Old Heritage Bourbon",
    classType: "Whiskey",
    alcoholContent: "45% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Heritage Distillers",
    bottlerAddress: "888 Oak Barrel Lane, Bardstown, KY 40004",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect gin match",
    colaId: generateColaId(7),
    brandName: "Botanical Garden Gin",
    classType: "Gin",
    alcoholContent: "47% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Garden Spirits Distillery",
    bottlerAddress: "202 Juniper Street, Portland, OR 97201",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect rum match",
    colaId: generateColaId(8),
    brandName: "Caribbean Sun Rum",
    classType: "Rum",
    alcoholContent: "40% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Caribbean Sun Distillers",
    bottlerAddress: "100 Palm Tree Ave, Miami, FL 33101",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect tequila match",
    colaId: generateColaId(9),
    brandName: "Agave Gold Tequila",
    classType: "Tequila",
    alcoholContent: "40% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Agave Gold Imports, LLC",
    bottlerAddress: "450 Southwest Plaza, Phoenix, AZ 85001",
    countryOfOrigin: "Mexico",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "clean_match",
    _testDescription: "Perfect brandy match",
    colaId: generateColaId(10),
    brandName: "Valley Oak Brandy",
    classType: "Brandy",
    alcoholContent: "40% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Valley Oak Distillery",
    bottlerAddress: "789 Orchard Road, Fresno, CA 93650",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },

  // ============================================================================
  // CATEGORY 2: Normalization Tests (4 applications)
  // These should match after normalization
  // ============================================================================
  {
    _testCategory: "normalization",
    _testDescription: "Case and punctuation differences",
    colaId: generateColaId(11),
    brandName: "MOUNTAIN PEAK VODKA",
    classType: "VODKA",
    alcoholContent: "40% ALC./VOL.",
    netContents: "750ML",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Mountain Peak Distilling",
    bottlerAddress: "100 Summit Ave, Boulder, CO 80301",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "normalization",
    _testDescription: "ABV format variation",
    colaId: generateColaId(12),
    brandName: "Cedar Ridge Whiskey",
    classType: "Whiskey",
    alcoholContent: "80 Proof",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Cedar Ridge Distillery",
    bottlerAddress: "200 Oak Street, Des Moines, IA 50301",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "normalization",
    _testDescription: "Net contents format variation",
    colaId: generateColaId(13),
    brandName: "River Bend Gin",
    classType: "Gin",
    alcoholContent: "45% Alc./Vol.",
    netContents: "0.75 L",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "River Bend Spirits",
    bottlerAddress: "300 River Road, Richmond, VA 23219",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "normalization",
    _testDescription: "Spacing differences",
    colaId: generateColaId(14),
    brandName: "Highland Scotch",
    classType: "Whisky",
    alcoholContent: "40%Alc./Vol.",
    netContents: "1L",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Highland Spirits Ltd.",
    bottlerAddress: "400 Glen Road, Edinburgh, Scotland",
    countryOfOrigin: "Scotland",
    status: "READY",
    images: [{ imageType: "FRONT" }],
  },

  // ============================================================================
  // CATEGORY 3: Clear Mismatches (4 applications)
  // These should be flagged as mismatches
  // ============================================================================
  {
    _testCategory: "mismatch",
    _testDescription: "Brand name mismatch",
    colaId: generateColaId(15),
    brandName: "Sunset Ridge Bourbon",
    classType: "Whiskey",
    alcoholContent: "42% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Sunset Ridge Distillery",
    bottlerAddress: "500 Bourbon Lane, Lexington, KY 40507",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "mismatch",
    _testDescription: "Alcohol content mismatch",
    colaId: generateColaId(16),
    brandName: "Silver Lake Vodka",
    classType: "Vodka",
    alcoholContent: "40% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Silver Lake Spirits",
    bottlerAddress: "600 Lake Drive, Chicago, IL 60601",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "mismatch",
    _testDescription: "Net contents mismatch",
    colaId: generateColaId(17),
    brandName: "Prairie Wind Beer",
    classType: "Beer",
    alcoholContent: "5.5% Alc./Vol.",
    netContents: "12 FL OZ",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Prairie Wind Brewing",
    bottlerAddress: "700 Prairie Road, Wichita, KS 67202",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "mismatch",
    _testDescription: "Class/type mismatch",
    colaId: generateColaId(18),
    brandName: "Forest Glen Spirits",
    classType: "Gin",
    alcoholContent: "42% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Forest Glen Distillery",
    bottlerAddress: "800 Pine Lane, Seattle, WA 98101",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },

  // ==========================================================================
  // CATEGORY 4: Government Warning Issues (3 applications)
  // ==========================================================================
  {
    _testCategory: "warning_issue",
    _testDescription: "Missing government warning",
    colaId: generateColaId(19),
    brandName: "Desert Bloom Wine",
    classType: "Wine",
    alcoholContent: "12.5% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: "",
    bottlerName: "Desert Bloom Vineyards",
    bottlerAddress: "900 Desert Road, Tucson, AZ 85701",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "warning_issue",
    _testDescription: "Warning text case variation",
    colaId: generateColaId(20),
    brandName: "North Star Whiskey",
    classType: "Whiskey",
    alcoholContent: "43% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: "Government Warning: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
    bottlerName: "North Star Distillers",
    bottlerAddress: "1000 North Road, Minneapolis, MN 55401",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "warning_issue",
    _testDescription: "Warning text altered wording",
    colaId: generateColaId(21),
    brandName: "Amber Ridge Rum",
    classType: "Rum",
    alcoholContent: "40% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: "GOVERNMENT WARNING: (1) Drinking alcohol during pregnancy may cause birth defects. (2) Alcohol consumption may impair your ability to drive or operate machinery.",
    bottlerName: "Amber Ridge Distillers",
    bottlerAddress: "1100 Harbor Drive, Tampa, FL 33602",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },

  // ==========================================================================
  // CATEGORY 5: Producer Info Mismatches (2 applications)
  // ==========================================================================
  {
    _testCategory: "producer_mismatch",
    _testDescription: "Bottler address mismatch",
    colaId: generateColaId(22),
    brandName: "Oak Barrel Bourbon",
    classType: "Whiskey",
    alcoholContent: "46% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Oak Barrel Distillery",
    bottlerAddress: "1200 Bourbon Street, Louisville, KY 40202",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "producer_mismatch",
    _testDescription: "Country of origin mismatch",
    colaId: generateColaId(23),
    brandName: "Alpine Ridge Vodka",
    classType: "Vodka",
    alcoholContent: "40% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Alpine Ridge Spirits",
    bottlerAddress: "1300 Alpine Way, Salt Lake City, UT 84101",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },

  // ==========================================================================
  // CATEGORY 6: OCR Challenges (2 applications)
  // ==========================================================================
  {
    _testCategory: "ocr_challenge",
    _testDescription: "Low quality label with noise",
    colaId: generateColaId(24),
    brandName: "Vintage Reserve",
    classType: "Whiskey",
    alcoholContent: "45% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Artisan Spirits Co.",
    bottlerAddress: "321 Craft Lane, Portland, OR 97201",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },
  {
    _testCategory: "ocr_challenge",
    _testDescription: "Handwritten batch number elements on label",
    colaId: generateColaId(25),
    brandName: "Barrel Select Bourbon",
    classType: "Whiskey",
    alcoholContent: "46% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Barrel Select Distillery",
    bottlerAddress: "654 Cooperage Road, Frankfort, KY 40601",
    countryOfOrigin: "USA",
    status: "NEEDS_ATTENTION",
    images: [{ imageType: "FRONT" }],
  },

  // ==========================================================================
  // CATEGORY 7: Multi-Image Applications (3 applications)
  // Front + back labels with split information
  // ==========================================================================
  {
    _testCategory: "multi_image",
    _testDescription:
      "Front + back labels - brand on front, warning on back",
    colaId: generateColaId(26),
    brandName: "Twin Peaks Cabernet",
    classType: "Wine",
    alcoholContent: "13.9% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Twin Peaks Winery",
    bottlerAddress: "Twin Peaks Road, Paso Robles, CA 93446",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }, { imageType: "BACK" }],
  },
  {
    _testCategory: "multi_image",
    _testDescription: "Front + back + neck labels - full label set",
    colaId: generateColaId(27),
    brandName: "Reserve Collection Whiskey",
    classType: "Whiskey",
    alcoholContent: "43% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Reserve Collection Distillers",
    bottlerAddress: "100 Reserve Drive, Nashville, TN 37201",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }, { imageType: "BACK" }, { imageType: "NECK" }],
  },
  {
    _testCategory: "multi_image",
    _testDescription:
      "Front + back labels - producer info split across labels",
    colaId: generateColaId(28),
    brandName: "Coastal Vineyards Pinot Noir",
    classType: "Wine",
    alcoholContent: "14.2% Alc./Vol.",
    netContents: "750 mL",
    governmentWarning: GOVERNMENT_WARNING,
    bottlerName: "Coastal Vineyards Estate",
    bottlerAddress: "Coast Highway 1, Santa Barbara, CA 93101",
    countryOfOrigin: "USA",
    status: "READY",
    images: [{ imageType: "FRONT" }, { imageType: "BACK" }],
  },
];
