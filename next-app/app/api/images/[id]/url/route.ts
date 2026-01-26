import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateSasUrl,
  isAzureConfigured,
  isAzureBlobUrl,
} from "@/lib/storage/blob";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the LabelImage record
    const labelImage = await prisma.labelImage.findUnique({
      where: { id },
      select: { blobUrl: true },
    });

    if (!labelImage) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const { blobUrl } = labelImage;

    // If Azure is configured and this is an Azure blob URL, generate SAS URL
    if (isAzureConfigured() && isAzureBlobUrl(blobUrl)) {
      const sasUrl = await generateSasUrl(blobUrl);
      return NextResponse.json({ url: sasUrl });
    }

    // Otherwise, return the URL as-is (local development)
    return NextResponse.json({ url: blobUrl });
  } catch (error) {
    console.error("Error generating image URL:", error);
    return NextResponse.json(
      { error: "Failed to generate image URL" },
      { status: 500 }
    );
  }
}
