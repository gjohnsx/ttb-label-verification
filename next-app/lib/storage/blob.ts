import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER || "label-images";

/**
 * Check if Azure Blob Storage is configured
 */
export function isAzureConfigured(): boolean {
  return !!connectionString;
}

/**
 * Get the BlobServiceClient (lazy initialization)
 */
function getBlobServiceClient(): BlobServiceClient {
  if (!connectionString) {
    throw new Error("Azure Storage connection string not configured");
  }
  return BlobServiceClient.fromConnectionString(connectionString);
}

/**
 * Parse the connection string to extract account name and key
 */
function parseConnectionString(): {
  accountName: string;
  accountKey: string;
} {
  if (!connectionString) {
    throw new Error("Azure Storage connection string not configured");
  }

  const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
  const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);

  if (!accountNameMatch || !accountKeyMatch) {
    throw new Error("Invalid Azure Storage connection string format");
  }

  return {
    accountName: accountNameMatch[1],
    accountKey: accountKeyMatch[1],
  };
}

/**
 * Upload a label image to Azure Blob Storage
 * @param file - The image buffer to upload
 * @param filename - The desired filename (will be prefixed with timestamp for uniqueness)
 * @param contentType - The MIME type of the image
 * @returns The blob URL (without SAS token)
 */
export async function uploadLabelImage(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Ensure container exists
  await containerClient.createIfNotExists({
    access: undefined, // Private access - require SAS for reads
  });

  // Generate unique blob name with timestamp
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blobName = `${timestamp}-${sanitizedFilename}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(file, file.length, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  });

  return blockBlobClient.url;
}

/**
 * Generate a SAS URL for reading a blob (1 hour expiry)
 * @param blobUrl - The blob URL (without SAS token)
 * @returns The blob URL with SAS token appended
 */
export async function generateSasUrl(blobUrl: string): Promise<string> {
  if (!isAzureConfigured()) {
    // If Azure is not configured, return the URL as-is (for local development)
    return blobUrl;
  }

  // Parse the blob URL to extract container and blob name
  const url = new URL(blobUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length < 2) {
    throw new Error("Invalid blob URL format");
  }

  const container = pathParts[0];
  const blobName = pathParts.slice(1).join("/");

  const { accountName, accountKey } = parseConnectionString();
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  // Generate SAS token with 1 hour expiry
  const startsOn = new Date();
  const expiresOn = new Date(startsOn.getTime() + 60 * 60 * 1000); // 1 hour

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName: blobName,
      permissions: BlobSASPermissions.parse("r"), // Read only
      startsOn: startsOn,
      expiresOn: expiresOn,
      protocol: SASProtocol.Https,
    },
    sharedKeyCredential
  ).toString();

  return `${blobUrl}?${sasToken}`;
}

/**
 * Delete a label image from Azure Blob Storage
 * @param blobUrl - The blob URL to delete
 */
export async function deleteLabelImage(blobUrl: string): Promise<void> {
  if (!isAzureConfigured()) {
    // If Azure is not configured, nothing to delete
    return;
  }

  // Parse the blob URL to extract container and blob name
  const url = new URL(blobUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length < 2) {
    throw new Error("Invalid blob URL format");
  }

  const container = pathParts[0];
  const blobName = pathParts.slice(1).join("/");

  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(container);
  const blobClient = containerClient.getBlobClient(blobName);

  await blobClient.deleteIfExists();
}

/**
 * Check if a URL is an Azure Blob Storage URL
 */
export function isAzureBlobUrl(url: string): boolean {
  return url.includes(".blob.core.windows.net");
}
