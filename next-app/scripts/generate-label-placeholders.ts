#!/usr/bin/env bun

/**
 * Generate placeholder JPG label images for seed data
 *
 * Creates simple raster placeholders that can be used during development
 * before real label images are available.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { applications, type ApplicationData } from "../prisma/seed-data";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const LABELS_DIR = path.join(SCRIPT_DIR, "../public/labels");
const OUTPUT_EXTENSION = "jpg";
const OUTPUT_QUALITY = 80;

// Ensure directory exists
if (!fs.existsSync(LABELS_DIR)) {
  fs.mkdirSync(LABELS_DIR, { recursive: true });
}

type Category = {
  name: string;
  borderColor: string;
  bgColor: string;
  apps: string[];
  types: string[];
  hasNoise?: boolean;
};

const appDataById = new Map<string, ApplicationData>();
applications.forEach((app, index) => {
  const appId = `app-${String(index + 1).padStart(3, "0")}`;
  appDataById.set(appId, app);
});

// Category definitions with colors and app ranges
const categories: Category[] = [
  {
    name: "Clean Match",
    borderColor: "#22c55e", // green-500
    bgColor: "#dcfce7", // green-100
    apps: Array.from({ length: 10 }, (_, i) =>
      `app-${String(i + 1).padStart(3, "0")}`
    ),
    types: ["front"],
  },
  {
    name: "Normalization Test",
    borderColor: "#3b82f6", // blue-500
    bgColor: "#dbeafe", // blue-100
    apps: ["app-011", "app-012", "app-013", "app-014"],
    types: ["front"],
  },
  {
    name: "Clear Mismatch",
    borderColor: "#ef4444", // red-500
    bgColor: "#fee2e2", // red-100
    apps: ["app-015", "app-016", "app-017", "app-018"],
    types: ["front"],
  },
  {
    name: "Gov Warning Issue",
    borderColor: "#f97316", // orange-500
    bgColor: "#ffedd5", // orange-100
    apps: ["app-019", "app-020", "app-021"],
    types: ["front"],
  },
  {
    name: "Producer Mismatch",
    borderColor: "#a855f7", // purple-500
    bgColor: "#f3e8ff", // purple-100
    apps: ["app-022", "app-023"],
    types: ["front"],
  },
  {
    name: "OCR Challenge",
    borderColor: "#6b7280", // gray-500
    bgColor: "#f3f4f6", // gray-100
    apps: ["app-024", "app-025"],
    types: ["front"],
    hasNoise: true,
  },
  {
    name: "Multi-Image",
    borderColor: "#14b8a6", // teal-500
    bgColor: "#ccfbf1", // teal-100
    apps: ["app-026", "app-027", "app-028"],
    types: ["front", "back"],
  },
].map((category) => ({
  ...category,
  types: category.types.includes("back")
    ? category.types
    : [...category.types, "back"],
}));

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Generate noise pattern for OCR challenge labels
function getNoisePattern(id: string): string {
  return `
    <defs>
      <pattern id="noise-${id}" patternUnits="userSpaceOnUse" width="100" height="100">
        <rect width="100" height="100" fill="#f3f4f6"/>
        ${Array.from({ length: 50 }, () => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 3 + 1;
          const opacity = Math.random() * 0.3 + 0.1;
          return `<circle cx="${x}" cy="${y}" r="${size}" fill="#9ca3af" opacity="${opacity}"/>`;
        }).join("\n        ")}
      </pattern>
    </defs>`;
}

function getFieldValue(
  appData: ApplicationData | undefined,
  value: keyof ApplicationData,
  fallback: string
): string {
  const fieldValue = appData?.[value];
  if (typeof fieldValue === "string" && fieldValue.trim().length > 0) {
    return escapeXml(fieldValue);
  }
  return escapeXml(fallback);
}

// Generate SVG content
function generateSVG(
  appId: string,
  imageType: string,
  category: Category,
  appData?: ApplicationData
): string {
  const width = 400;
  const height = 600;
  const { name, borderColor, bgColor, hasNoise } = category;

  const noisePatternId = `noise-${appId}-${imageType}`;
  const fillColor = hasNoise ? `url(#${noisePatternId})` : bgColor;

  const brandName = getFieldValue(appData, "brandName", "BRAND NAME");
  const classType = getFieldValue(appData, "classType", "Wine/Beer/Spirits");
  const alcoholContent = getFieldValue(appData, "alcoholContent", "XX.X%");
  const netContents = getFieldValue(appData, "netContents", "XXX mL");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${hasNoise ? getNoisePattern(`${appId}-${imageType}`) : ""}

  <!-- Background -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="${fillColor}" stroke="${borderColor}" stroke-width="8"/>

  <!-- Inner border -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="${borderColor}" stroke-width="2" stroke-dasharray="10,5"/>

  <!-- Header area (Brand) -->
  <rect x="40" y="40" width="${width - 80}" height="80" fill="white" stroke="${borderColor}" stroke-width="1"/>
  <text x="${width / 2}" y="90" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${borderColor}" textLength="280" lengthAdjust="spacingAndGlyphs">
    ${brandName}
  </text>

  <!-- Application ID -->
  <text x="${width / 2}" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#1f2937">
    ${appId.toUpperCase()}
  </text>

  <!-- Image type badge -->
  <rect x="${width / 2 - 50}" y="180" width="100" height="36" rx="4" fill="${borderColor}"/>
  <text x="${width / 2}" y="205" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">
    ${imageType.toUpperCase()}
  </text>

  <!-- Category label -->
  <text x="${width / 2}" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
    Test Category: ${name}
  </text>

  <!-- Mock label content area -->
  <rect x="40" y="290" width="${width - 80}" height="120" fill="white" stroke="#d1d5db" stroke-width="1"/>
  <text x="50" y="320" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">Product Information</text>
  <line x1="50" y1="335" x2="${width - 50}" y2="335" stroke="#e5e7eb" stroke-width="1"/>
  <text x="50" y="360" font-family="Arial, sans-serif" font-size="11" fill="#9ca3af">ABV: ${alcoholContent}</text>
  <text x="50" y="380" font-family="Arial, sans-serif" font-size="11" fill="#9ca3af">Volume: ${netContents}</text>
  <text x="50" y="400" font-family="Arial, sans-serif" font-size="11" fill="#9ca3af">Class: ${classType}</text>

  <!-- Government Warning area -->
  <rect x="40" y="430" width="${width - 80}" height="100" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
  <text x="${width / 2}" y="455" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#92400e">
    GOVERNMENT WARNING
  </text>
  <text x="50" y="475" font-family="Arial, sans-serif" font-size="9" fill="#78350f">
    (1) According to the Surgeon General,
  </text>
  <text x="50" y="490" font-family="Arial, sans-serif" font-size="9" fill="#78350f">
    women should not drink alcoholic
  </text>
  <text x="50" y="505" font-family="Arial, sans-serif" font-size="9" fill="#78350f">
    beverages during pregnancy...
  </text>
  <text x="50" y="520" font-family="Arial, sans-serif" font-size="9" fill="#78350f">
    (2) Consumption of alcoholic beverages...
  </text>

  <!-- Footer -->
  <text x="${width / 2}" y="${height - 30}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">
    PLACEHOLDER IMAGE - Development Only
  </text>
</svg>`;
}

async function writeJpegFromSvg(svgContent: string, filepath: string) {
  await sharp(Buffer.from(svgContent))
    .jpeg({ quality: OUTPUT_QUALITY })
    .toFile(filepath);
}

// Generate all images
async function generateAll() {
  let totalGenerated = 0;

  for (const category of categories) {
    for (const appId of category.apps) {
      for (const imageType of category.types) {
        const filename = `${appId}-${imageType}.${OUTPUT_EXTENSION}`;
        const filepath = path.join(LABELS_DIR, filename);
        const appData = appDataById.get(appId);
        const content = generateSVG(appId, imageType, category, appData);

        await writeJpegFromSvg(content, filepath);
        console.log(`Generated: ${filename}`);
        totalGenerated++;
      }
    }
  }

  // Also create neck labels for multi-image apps
  const multiImageCategory = categories.find(
    (category) => category.name === "Multi-Image"
  );
  if (!multiImageCategory) {
    throw new Error("Multi-Image category not found");
  }

  for (const appId of multiImageCategory.apps) {
    const filename = `${appId}-neck.${OUTPUT_EXTENSION}`;
    const filepath = path.join(LABELS_DIR, filename);
    const content = generateNeckSVG(appId, multiImageCategory);

    await writeJpegFromSvg(content, filepath);
    console.log(`Generated: ${filename}`);
    totalGenerated++;
  }

  console.log(
    `\n✓ Generated ${totalGenerated} placeholder label images in ${LABELS_DIR}`
  );
}

// Generate neck label (smaller, different shape)
function generateNeckSVG(appId: string, category: Category): string {
  const width = 200;
  const height = 150;
  const { borderColor, bgColor } = category;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="${bgColor}" stroke="${borderColor}" stroke-width="4"/>

  <!-- Application ID -->
  <text x="${width / 2}" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1f2937">
    ${appId.toUpperCase()}
  </text>

  <!-- Image type badge -->
  <rect x="${width / 2 - 35}" y="65" width="70" height="28" rx="4" fill="${borderColor}"/>
  <text x="${width / 2}" y="85" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">
    NECK
  </text>

  <!-- Footer -->
  <text x="${width / 2}" y="${height - 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#9ca3af">
    Neck Label Placeholder
  </text>
</svg>`;
}

generateAll().catch((error) => {
  console.error("Failed to generate placeholder labels:", error);
  process.exit(1);
});
