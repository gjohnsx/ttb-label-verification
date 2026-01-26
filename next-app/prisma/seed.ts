/**
 * Seed script for TTB Label Verification app
 *
 * Creates ~30 applications with various test scenarios:
 * - 10 clean matches (all fields match perfectly)
 * - 4 normalization tests (case, punctuation, spacing, ABV format variations)
 * - 4 clear mismatches (brand, ABV, net contents, class/type differ)
 * - 3 government warning issues (missing, wrong case, altered wording)
 * - 2 producer info mismatches (address, country of origin differ)
 * - 2 OCR challenges (low quality images, handwritten elements)
 * - 3 multi-image applications (front + back labels with split info)
 * - Additional back labels added to a majority of applications
 *
 * Run with: bun prisma/seed.ts
 */

import prisma from "../lib/prisma";
import { applications, type ImageType } from "./seed-data";

const BACK_LABEL_PROBABILITY = 0.7;

function shouldAddBackLabel(index: number): boolean {
  const roll = (index * 37) % 100;
  return roll < Math.round(BACK_LABEL_PROBABILITY * 100);
}

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seed() {
  console.log("Starting seed...");
  console.log(`Creating ${applications.length} applications...`);

  // Clear existing data (in reverse order of dependencies)
  console.log("Clearing existing data...");
  await prisma.auditEvent.deleteMany();
  await prisma.review.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.ocrResult.deleteMany();
  await prisma.labelImage.deleteMany();
  await prisma.application.deleteMany();

  let createdCount = 0;

  for (let i = 0; i < applications.length; i++) {
    const appData = applications[i];
    const { images, _testCategory, _testDescription, ...applicationData } =
      appData;

    // Create the application
    const application = await prisma.application.create({
      data: applicationData,
    });

    // Create label images for this application
    // Use padded index (001, 002, etc.) to match file naming convention
    const paddedIndex = String(i + 1).padStart(3, "0");

    const imageTypes = new Set<ImageType>(images.map((image) => image.imageType));
    if (!imageTypes.has("BACK") && shouldAddBackLabel(i + 1)) {
      imageTypes.add("BACK");
    }

    for (const imageType of imageTypes) {
      const imageTypeLower = imageType.toLowerCase();

      await prisma.labelImage.create({
        data: {
          applicationId: application.id,
          blobUrl: `/labels/app-${paddedIndex}-${imageTypeLower}.jpg`,
          imageType,
        },
      });
    }

    createdCount++;
    console.log(
      `  [${createdCount}/${applications.length}] Created: ${applicationData.brandName} (${_testCategory})`
    );
  }

  console.log("\nSeed completed successfully!");
  console.log(`Total applications created: ${createdCount}`);
  console.log("\nBreakdown by category:");
  console.log(
    `  - Clean matches: ${applications.filter((a) => a._testCategory === "clean_match").length}`
  );
  console.log(
    `  - Normalization tests: ${applications.filter((a) => a._testCategory === "normalization").length}`
  );
  console.log(
    `  - Clear mismatches: ${applications.filter((a) => a._testCategory === "mismatch").length}`
  );
  console.log(
    `  - Warning issues: ${applications.filter((a) => a._testCategory === "warning_issue").length}`
  );
  console.log(
    `  - Producer mismatches: ${applications.filter((a) => a._testCategory === "producer_mismatch").length}`
  );
  console.log(
    `  - OCR challenges: ${applications.filter((a) => a._testCategory === "ocr_challenge").length}`
  );
  console.log(
    `  - Multi-image: ${applications.filter((a) => a._testCategory === "multi_image").length}`
  );
}

// Run the seed
seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
