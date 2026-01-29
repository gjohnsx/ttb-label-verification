import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const inputDir = path.resolve(
  process.cwd(),
  process.argv[2] ?? "../../dataset/scraped/output"
);
const outputCsv = path.resolve(
  process.cwd(),
  process.argv[3] ?? "../../dataset/scraped/scraped-import.csv"
);
const blobBaseUrl =
  process.env.BLOB_BASE_URL ??
  "https://ttblabelsdev.blob.core.windows.net/demo";

interface ExtractedFields {
  TTB_ID: string;
  BRAND_NAME: string;
  ALCOHOL_CONTENT: string;
  NET_CONTENTS: string;
  PRODUCT_TYPE: string;
  CLASS_NAME: string;
  APPLICANT_NAME: string;
  ADDRESS_TEXT: string;
  ADDRESS_STATE: string;
  ADDRESS_ZIP_CODE: string;
  ORIGIN_NAME: string;
  FANCIFUL_NAME: string;
  GRAPE_VARIETALS: string;
  WINE_APPELLATION: string;
  SERIAL_NUMBER: string;
  PERMIT_NUMBER: string;
  APPLICATION_DATE: string;
  APPROVAL_DATE: string;
  EXPIRATION_DATE: string;
  APPLICATION_STATUS: string;
  IMAGE_URLS: string;
}

function normalizeUnit(raw: string): string {
  const cleaned = raw.replace(/\./g, "").replace(/\s+/g, " ").trim().toUpperCase();
  if (cleaned === "FLOZ" || cleaned === "FL OZ") return "FL OZ";
  if (cleaned === "OZ") return "OZ";
  if (cleaned === "PT") return "PT";
  if (cleaned === "QT") return "QT";
  if (cleaned === "GAL") return "GAL";
  if (cleaned === "ML") return "ML";
  if (cleaned === "CL") return "CL";
  if (cleaned === "L") return "L";
  if (cleaned === "PINT") return "PINT";
  if (cleaned === "PINTS") return "PINT";
  if (cleaned.startsWith("MILLILITER")) return "ML";
  if (cleaned.startsWith("LITER") || cleaned.startsWith("LITRE")) return "L";
  if (cleaned.startsWith("GALLON")) return "GAL";
  return cleaned;
}

function extractAlcoholContent(labelText: string, productType?: string): string {
  const proofMatch = labelText.match(/\b(\d+(?:\.\d+)?)\s*PROOF\b/i);
  if (proofMatch) {
    return `${proofMatch[1]} PROOF`;
  }

  const alcBeforeMatch = labelText.match(
    /\bALC\.?\s*(\d+(?:\.\d+)?)\s*%?(?:\s*BY\s*VOL\.?|\s*VOL\.?|\s*VOLUME)?\b/i
  );
  if (alcBeforeMatch) {
    return `${alcBeforeMatch[1]}% ALC/VOL.`;
  }

  const alcoholBeforeMatch = labelText.match(
    /\bALCOHOL\s*(\d+(?:\.\d+)?)\s*%?(?:\s*BY\s*VOL\.?|\s*VOL\.?|\s*VOLUME)?\b/i
  );
  if (alcoholBeforeMatch) {
    return `${alcoholBeforeMatch[1]}% ALC/VOL.`;
  }

  const alcMatch = labelText.match(
    /\b(\d+(?:\.\d+)?)\s*%?\s*(?:ALC\.?\/VOL\.?|ALC\.?\s*VOL\.?|ALC\.?\s*BY\s*VOL\.?|ALC\.?\s*BY\s*VOLUME|ABV|ALCOHOL(?:\s*BY\s*VOLUME)?)\b/i
  );
  if (alcMatch) {
    return `${alcMatch[1]}% ALC/VOL.`;
  }

  const percentMatches = [...labelText.matchAll(/\b(\d+(?:\.\d+)?)\s*%/g)];
  if (percentMatches.length && productType) {
    const ranges: Record<string, [number, number]> = {
      "WINE": [7, 17],
      "MALT BEVERAGE": [2, 15],
      "DISTILLED SPIRITS": [30, 70],
    };
    const range = ranges[productType.toUpperCase()];
    if (range) {
      for (const match of percentMatches) {
        const value = Number(match[1]);
        if (value >= range[0] && value <= range[1]) {
          return `${match[1]}% ALC/VOL.`;
        }
      }
    }
  }

  return "";
}

function extractNetContents(labelText: string): string {
  const netMatch = labelText.match(
    /\b(\d+(?:\.\d+)?)(?:\s*)(ML|MI|MILLILITER[S]?|CL|L|LITER[S]?|LITRE[S]?|FL\.?\s*OZ|OZ|PINTS?|PT|QUARTS?|QT|GALLONS?|GAL)\b/i
  );
  if (!netMatch) return "";
  const value = netMatch[1];
  const unit = normalizeUnit(netMatch[2] === "MI" ? "ML" : netMatch[2]);
  return `${value} ${unit}`;
}

function extractLabelFields(
  pages: Array<{ markdown?: string }>,
  productType?: string
): Partial<ExtractedFields> {
  const labelText = pages.map((p) => p.markdown ?? "").join("\n");
  return {
    ALCOHOL_CONTENT: extractAlcoholContent(labelText, productType),
    NET_CONTENTS: extractNetContents(labelText),
  };
}

function bumpAlcohol(value: string): string {
  const proofMatch = value.match(/(\d+(?:\.\d+)?)\s*PROOF/i);
  if (proofMatch) {
    const next = Number(proofMatch[1]) + 2;
    return `${next} PROOF`;
  }
  const percentMatch = value.match(/(\d+(?:\.\d+)?)/);
  if (percentMatch) {
    const next = Number(percentMatch[1]) + 1;
    return `${next}% ALC/VOL.`;
  }
  return value;
}

function bumpNetContents(value: string): string {
  const cleaned = value.toUpperCase().replace(/\s+/g, " ").trim();
  const presets: Record<string, string> = {
    "750 ML": "1 L",
    "1 L": "750 ML",
    "1.5 L": "750 ML",
    "3 L": "1.5 L",
    "12 FL OZ": "16 FL OZ",
    "16 FL OZ": "12 FL OZ",
    "1 PINT": "12 FL OZ",
    "2 PINT": "1 QUART",
    "1 QT": "750 ML",
    "1 QUART": "750 ML",
  };
  if (presets[cleaned]) return presets[cleaned];

  const match = cleaned.match(/(\d+(?:\.\d+)?)\s+([A-Z ]+)/);
  if (!match) return value;
  const num = Number(match[1]);
  const unit = match[2].trim();
  if (Number.isNaN(num)) return value;
  return `${(num + 1).toString()} ${unit}`;
}

function applyMockMismatches(fields: Partial<ExtractedFields>, index: number): void {
  if (fields.ALCOHOL_CONTENT && index % 7 === 0) {
    fields.ALCOHOL_CONTENT = bumpAlcohol(fields.ALCOHOL_CONTENT);
  }
  if (fields.NET_CONTENTS && index % 5 === 0) {
    fields.NET_CONTENTS = bumpNetContents(fields.NET_CONTENTS);
  }
}

function extractFromTable0(content: string): Partial<ExtractedFields> {
  const fields: Partial<ExtractedFields> = {};

  // TTB ID
  const ttbMatch = content.match(/TTB ID\n(\d+)/);
  if (ttbMatch) fields.TTB_ID = ttbMatch[1];

  // Brand Name (field 6)
  const brandMatch = content.match(
    /6\. BRAND NAME \(Required\)\n([^\n|]+)/
  );
  if (brandMatch) fields.BRAND_NAME = brandMatch[1].trim();

  // Fanciful Name (field 7)
  const fancifulMatch = content.match(
    /7\. FANCIFUL NAME \(If any\)\n([^\n|]+)/
  );
  if (fancifulMatch) {
    const val = fancifulMatch[1].trim();
    if (val && val !== "|") fields.FANCIFUL_NAME = val;
  }

  // Product Type (field 5) — check which box is checked
  if (content.includes("☑ WINE")) fields.PRODUCT_TYPE = "WINE";
  else if (content.includes("☑ DISTILLED SPIRITS"))
    fields.PRODUCT_TYPE = "DISTILLED SPIRITS";
  else if (content.includes("☑ MALT BEVERAGE"))
    fields.PRODUCT_TYPE = "MALT BEVERAGE";

  // Source of Product (field 3)
  if (content.includes("☑ Domestic")) fields.ORIGIN_NAME = "Domestic";
  else if (content.includes("☑ Imported")) fields.ORIGIN_NAME = "Imported";

  // Permit Number (field 2)
  const permitMatch = content.match(
    /NO\. \(Required\)\n([A-Z]{2,}-[A-Z]{2,}-\d+|[A-Z]+-\d+)/
  );
  if (permitMatch) fields.PERMIT_NUMBER = permitMatch[1];

  // Serial Number (field 4)
  const serialMatch = content.match(
    /4\. SERIAL NUMBER\n\(Required\)\n(\d+)/
  );
  if (serialMatch) fields.SERIAL_NUMBER = serialMatch[1];

  // Applicant Name and Address (field 8)
  const applicantMatch = content.match(
    /TRADENAME IF USED ON LABEL \(Required\)\n([\s\S]*?)(?=\n\||\n\s*4\.)/
  );
  if (applicantMatch) {
    const lines = applicantMatch[1]
      .split("\n")
      .map((l) => l.replace(/\s*\|$/, "").trim())
      .filter(Boolean);
    if (lines.length > 0) fields.APPLICANT_NAME = lines[0];
    if (lines.length > 1) {
      // Remaining lines are address
      const addressLines = lines.slice(1);
      // Filter out "(Used on label)" lines from address
      const addrOnly = addressLines.filter(
        (l) => !l.includes("(Used on label)")
      );
      fields.ADDRESS_TEXT = addrOnly.join(", ");

      // Try to extract state and zip from last address line
      const lastLine = addressLines[addressLines.length - 1];
      // Handle "CITY STATE ZIP" or "CITY, STATE ZIP" pattern,
      // also "Name (Used on label)" lines at end
      for (const line of addressLines) {
        const stateZipMatch = line.match(
          /([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/
        );
        if (stateZipMatch) {
          fields.ADDRESS_STATE = stateZipMatch[1];
          fields.ADDRESS_ZIP_CODE = stateZipMatch[2];
        }
      }
    }
  }

  // Grape Varietals (field 10)
  const grapeMatch = content.match(
    /10\. GRAPE VARIETAL\(S\) \(Wine Only\)\n([^\n|]+)/
  );
  if (grapeMatch) {
    const val = grapeMatch[1].trim();
    if (val && val !== "N/A") fields.GRAPE_VARIETALS = val;
  }

  // Wine Appellation (field 11)
  const appellationMatch = content.match(
    /11\. WINE APPELLATION \(If on label\)\n([^\n|]+)/
  );
  if (appellationMatch) {
    const val = appellationMatch[1].trim();
    if (val) fields.WINE_APPELLATION = val;
  }

  // Application Date (field 16)
  const appDateMatch = content.match(
    /16\. DATE OF\nAPPLICATION\n(\d{2}\/\d{2}\/\d{4})/
  );
  if (appDateMatch) fields.APPLICATION_DATE = appDateMatch[1];

  // Approval Date (field 19)
  const approvalMatch = content.match(
    /19\. DATE ISSUED\n(\d{2}\/\d{2}\/\d{4})/
  );
  if (approvalMatch) fields.APPROVAL_DATE = approvalMatch[1];

  return fields;
}

function extractFromTable1(content: string): Partial<ExtractedFields> {
  const fields: Partial<ExtractedFields> = {};

  // Class/Type Description
  const classMatch = content.match(
    /CLASS\/TYPE DESCRIPTION\n([^\n|]+)/
  );
  if (classMatch) fields.CLASS_NAME = classMatch[1].trim();

  // Status
  const statusMatch = content.match(
    /THE STATUS IS ([A-Z]+)\./
  );
  if (statusMatch) fields.APPLICATION_STATUS = statusMatch[1];

  // Expiration Date
  const expirationMatch = content.match(
    /EXPIRATION DATE \(If\nany\)\n(\d{2}\/\d{2}\/\d{4})/
  );
  if (expirationMatch) fields.EXPIRATION_DATE = expirationMatch[1];

  return fields;
}

function buildImageUrls(ttbId: string, outputDir: string): string {
  const imageFiles = fs
    .readdirSync(outputDir)
    .filter((f) => /\.(jpeg|jpg|png)$/i.test(f))
    .sort();

  if (imageFiles.length === 0) return "";

  // Map images to types based on the OCR page context
  // Typically: first image(s) on page 1-2 are front label, last is back label
  const urls: string[] = [];
  for (let i = 0; i < imageFiles.length; i++) {
    const ext = path.extname(imageFiles[i]);
    const blobName = `${ttbId}_${i}${ext}`;
    const url = `${blobBaseUrl}/${blobName}`;
    // First image = front, second = back, rest = strip
    const type = i === 0 ? "front" : i === 1 ? "back" : "strip";
    urls.push(`${type}:${url}`);
  }

  return urls.join(",");
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function run(): void {
  const ttbDirs = fs
    .readdirSync(inputDir)
    .filter((d) => fs.statSync(path.join(inputDir, d)).isDirectory())
    .sort();

  console.log(`Processing ${ttbDirs.length} OCR outputs from ${inputDir}\n`);

  const columns: (keyof ExtractedFields)[] = [
    "TTB_ID",
    "BRAND_NAME",
    "ALCOHOL_CONTENT",
    "NET_CONTENTS",
    "IMAGE_URLS",
    "PRODUCT_TYPE",
    "CLASS_NAME",
    "APPLICATION_STATUS",
    "APPLICANT_NAME",
    "ADDRESS_TEXT",
    "ADDRESS_STATE",
    "ADDRESS_ZIP_CODE",
    "ORIGIN_NAME",
    "FANCIFUL_NAME",
    "GRAPE_VARIETALS",
    "WINE_APPELLATION",
    "SERIAL_NUMBER",
    "PERMIT_NUMBER",
    "APPLICATION_DATE",
    "APPROVAL_DATE",
    "EXPIRATION_DATE",
  ];

  const rows: string[][] = [];

  for (const ttbId of ttbDirs) {
    const dir = path.join(inputDir, ttbId);
    const jsonPath = path.join(dir, "ocr.json");

    if (!fs.existsSync(jsonPath)) {
      console.log(`  ${ttbId} — no ocr.json, skipping`);
      continue;
    }

    const ocr = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const pages = ocr.pages ?? [];

    let fields: Partial<ExtractedFields> = { TTB_ID: ttbId };

    // Extract from page 0 table (application form)
    const page0 = pages[0];
    if (page0?.tables?.length) {
      Object.assign(fields, extractFromTable0(page0.tables[0].content));
    }

    // Extract from page 1 table (TTB certificate)
    const page1 = pages[1];
    if (page1?.tables?.length) {
      Object.assign(fields, extractFromTable1(page1.tables[0].content));
    }

    // Extract label-side fields (used as mocked application values)
    Object.assign(fields, extractLabelFields(pages, fields.PRODUCT_TYPE));

    // Apply deterministic mock mismatches for demo coverage
    applyMockMismatches(fields, rows.length);

    // Build image URLs
    fields.IMAGE_URLS = buildImageUrls(ttbId, dir);

    // Build row
    const row = columns.map((col) => escapeCsvField(fields[col] ?? ""));
    rows.push(row);

    const imageCount = (fields.IMAGE_URLS?.match(/:/g) || []).length;
    console.log(
      `  ${ttbId} — ${fields.BRAND_NAME ?? "?"} (${fields.PRODUCT_TYPE ?? "?"}) — ${imageCount} images`
    );
  }

  // Write CSV
  const header = columns.join(",");
  const csvContent = [header, ...rows.map((r) => r.join(","))].join("\n");
  fs.writeFileSync(outputCsv, csvContent);

  console.log(`\nWrote ${rows.length} rows to ${outputCsv}`);
}

run();
