import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  throw new Error("MISTRAL_API_KEY is not set");
}

const inputPath = process.argv[2] ?? "../../cola-form/colas_ol_oim_um-application.pdf";
const outputDir = "outputs";

function encodePdf(pdfPath: string): string {
  const pdfBuffer = fs.readFileSync(pdfPath);
  return pdfBuffer.toString("base64");
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function buildMarkdown(pages: Array<{ index: number; markdown: string }>): string {
  return pages
    .map((page) => `# Page ${page.index + 1}\n\n${page.markdown}`)
    .join("\n\n---\n\n");
}

async function run(): Promise<void> {
  const client = new Mistral({ apiKey });
  const absoluteInputPath = path.resolve(process.cwd(), inputPath);
  const baseName = path.basename(absoluteInputPath, path.extname(absoluteInputPath));

  const base64Pdf = encodePdf(absoluteInputPath);

  const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      documentUrl: `data:application/pdf;base64,${base64Pdf}`,
    },
    tableFormat: "markdown",
    includeImageBase64: false,
  });

  ensureDir(outputDir);

  const jsonPath = path.join(outputDir, `${baseName}.ocr.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(ocrResponse, null, 2));

  const markdownPath = path.join(outputDir, `${baseName}.md`);
  const pages = ocrResponse.pages ?? [];
  fs.writeFileSync(markdownPath, buildMarkdown(pages));

  process.stdout.write(`Saved OCR JSON: ${jsonPath}\n`);
  process.stdout.write(`Saved OCR markdown: ${markdownPath}\n`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
