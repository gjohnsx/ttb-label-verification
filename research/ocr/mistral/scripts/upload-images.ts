import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
}

const containerName = process.env.AZURE_STORAGE_CONTAINER || "demo";
const inputDir = path.resolve(
  process.cwd(),
  process.argv[2] ?? "../../dataset/scraped/output"
);

async function run(): Promise<void> {
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString!);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const ttbDirs = fs
    .readdirSync(inputDir)
    .filter((d) => fs.statSync(path.join(inputDir, d)).isDirectory())
    .sort();

  console.log(`Uploading images from ${ttbDirs.length} directories`);
  console.log(`Container: ${containerName}\n`);

  let totalUploaded = 0;

  for (let i = 0; i < ttbDirs.length; i++) {
    const ttbId = ttbDirs[i];
    const dir = path.join(inputDir, ttbId);

    const imageFiles = fs
      .readdirSync(dir)
      .filter((f) => /\.(jpeg|jpg|png)$/i.test(f))
      .sort();

    if (imageFiles.length === 0) {
      console.log(`[${i + 1}/${ttbDirs.length}] ${ttbId} — no images`);
      continue;
    }

    console.log(
      `[${i + 1}/${ttbDirs.length}] ${ttbId} — ${imageFiles.length} images`
    );

    for (let j = 0; j < imageFiles.length; j++) {
      const file = imageFiles[j];
      const filePath = path.join(dir, file);
      const ext = path.extname(file);
      const blobName = `${ttbId}_${j}${ext}`;
      const contentType = ext.toLowerCase() === ".png" ? "image/png" : "image/jpeg";

      const buffer = fs.readFileSync(filePath);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: contentType },
      });

      console.log(`  → ${blobName} (${(buffer.length / 1024).toFixed(1)} KB)`);
      totalUploaded++;
    }
  }

  console.log(`\nDone. Uploaded ${totalUploaded} images.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
