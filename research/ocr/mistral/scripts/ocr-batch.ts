import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  throw new Error("MISTRAL_API_KEY is not set");
}

const inputDir = process.argv[2] ?? "../../dataset/scraped";
const outputBase = process.argv[3] ?? path.join(inputDir, "output");

function encodePdf(pdfPath: string): string {
  return fs.readFileSync(pdfPath).toString("base64");
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function hasBinary(cmd: string): boolean {
  const result = spawnSync("command", ["-v", cmd], { shell: true });
  return result.status === 0;
}

function clearExistingImages(outDir: string): void {
  if (!fs.existsSync(outDir)) return;
  for (const file of fs.readdirSync(outDir)) {
    if (/\.(jpeg|jpg|png|ppm|pbm)$/i.test(file)) {
      fs.unlinkSync(path.join(outDir, file));
    }
  }
}

function convertWithSips(inputPath: string, outputPath: string): boolean {
  if (!hasBinary("sips")) return false;
  const result = spawnSync("sips", ["-s", "format", "jpeg", inputPath, "--out", outputPath]);
  return result.status === 0 && fs.existsSync(outputPath);
}

function extractPdfImages(pdfPath: string, outDir: string): number {
  if (!hasBinary("pdfimages")) return 0;
  ensureDir(outDir);
  clearExistingImages(outDir);

  const prefix = path.join(outDir, "img");
  const result = spawnSync("pdfimages", ["-all", pdfPath, prefix]);
  if (result.status !== 0) {
    console.warn("  → pdfimages failed; falling back to OCR images");
    return 0;
  }

  const files = fs.readdirSync(outDir);
  const ppmFiles = files.filter((f) => f.endsWith(".ppm") || f.endsWith(".pbm"));
  for (const file of ppmFiles) {
    const inputFile = path.join(outDir, file);
    const outputFile = inputFile.replace(/\.(ppm|pbm)$/i, ".jpeg");
    if (convertWithSips(inputFile, outputFile)) {
      fs.unlinkSync(inputFile);
    }
  }

  return fs
    .readdirSync(outDir)
    .filter((f) => /\.(jpeg|jpg|png)$/i.test(f)).length;
}

function buildMarkdown(pages: Array<{ index: number; markdown: string }>): string {
  return pages
    .map((page) => `# Page ${page.index + 1}\n\n${page.markdown}`)
    .join("\n\n---\n\n");
}

function saveImages(pages: any[], outDir: string): number {
  let count = 0;
  for (const page of pages) {
    if (!page.images?.length) continue;
    for (const img of page.images) {
      const base64Data = img.image_base64 ?? img.imageBase64;
      if (!base64Data) continue;
      // Strip data URI prefix if present
      const raw = base64Data.replace(/^data:image\/\w+;base64,/, "");
      const ext = base64Data.startsWith("data:image/png") ? "png" : "jpeg";
      const filename = `img-${page.index}-${img.id ?? count}.${ext}`;
      fs.writeFileSync(path.join(outDir, filename), Buffer.from(raw, "base64"));
      count++;
    }
  }
  return count;
}

function stripBase64FromJson(ocrResponse: any): any {
  // Deep clone and strip image_base64 to keep JSON files small
  const clone = JSON.parse(JSON.stringify(ocrResponse));
  for (const page of clone.pages ?? []) {
    for (const img of page.images ?? []) {
      if (img.image_base64) img.image_base64 = "[saved to disk]";
      if (img.imageBase64) img.imageBase64 = "[saved to disk]";
    }
  }
  return clone;
}

async function processPdf(client: Mistral, pdfPath: string, outDir: string): Promise<void> {
  const base64Pdf = encodePdf(pdfPath);

  const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      documentUrl: `data:application/pdf;base64,${base64Pdf}`,
    },
    tableFormat: "markdown",
    includeImageBase64: true,
  });

  ensureDir(outDir);

  const pages = (ocrResponse.pages ?? []) as any[];

  // Prefer higher-resolution images extracted directly from PDF
  let imgCount = extractPdfImages(pdfPath, outDir);
  if (imgCount === 0) {
    // Fallback to OCR-provided images if pdfimages isn't available or fails
    imgCount = saveImages(pages, outDir);
  }

  // Save JSON (with base64 stripped)
  const jsonPath = path.join(outDir, "ocr.json");
  fs.writeFileSync(jsonPath, JSON.stringify(stripBase64FromJson(ocrResponse), null, 2));

  // Save markdown
  const mdPath = path.join(outDir, "ocr.md");
  fs.writeFileSync(mdPath, buildMarkdown(pages));

  console.log(`  → ${pages.length} pages, ${imgCount} images saved`);
}

async function run(): Promise<void> {
  const client = new Mistral({ apiKey });
  const absInputDir = path.resolve(process.cwd(), inputDir);
  const absOutputBase = path.resolve(process.cwd(), outputBase);

  const pdfFiles = fs
    .readdirSync(absInputDir)
    .filter((f) => f.endsWith(".pdf"))
    .sort();

  console.log(`Found ${pdfFiles.length} PDFs in ${absInputDir}`);
  console.log(`Output: ${absOutputBase}\n`);

  for (let i = 0; i < pdfFiles.length; i++) {
    const file = pdfFiles[i];
    const ttbId = path.basename(file, ".pdf");
    const pdfPath = path.join(absInputDir, file);
    const outDir = path.join(absOutputBase, ttbId);

    console.log(`[${i + 1}/${pdfFiles.length}] ${ttbId}`);
    try {
      await processPdf(client, pdfPath, outDir);
    } catch (err: any) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  console.log("\nDone.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
