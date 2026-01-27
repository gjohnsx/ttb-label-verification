/**
 * Gemini Vision wrapper for detecting bounding boxes on label images
 *
 * Uses Google's Gemini model to identify and locate specific elements
 * on beverage labels (ABV, net contents, government warning, etc.)
 */

import { GoogleGenAI } from "@google/genai";

// Model configuration - Gemini 2.0 Flash has good bounding box support
const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Bounding box result from Gemini
 * Coordinates are normalized to 0-1000 scale
 */
export interface BoundingBox {
  /** Label describing what was detected */
  label: string;
  /** Bounding box coordinates [y_min, x_min, y_max, x_max] normalized to 0-1000 */
  box_2d: [number, number, number, number];
}

/**
 * Result of bounding box detection
 */
export interface BoundingBoxResult {
  /** Array of detected bounding boxes */
  boxes: BoundingBox[];
  /** Time taken to process in milliseconds */
  processingTimeMs: number;
  /** Model version used */
  modelVersion: string;
  /** Raw response from the model */
  rawResponse: string;
}

/**
 * TTB label fields to detect with bounding boxes
 */
const TTB_DETECTION_PROMPT = `Analyze this beverage label image and detect the bounding boxes for the following TTB compliance elements if they are visible:

1. **Brand Name** - The product/brand name prominently displayed
2. **Class/Type** - The beverage classification (e.g., "Whiskey", "Vodka", "Wine")
3. **Alcohol Content / ABV** - The alcohol percentage (e.g., "40% Alc./Vol.", "80 Proof")
4. **Net Contents** - The volume of the container (e.g., "750 mL", "1 Liter")
5. **Government Warning** - The government health warning text block
6. **Bottler/Producer Name** - The company name
7. **Bottler/Producer Address** - The address information
8. **Country of Origin** - Country where the product was made
9. **UPC/Barcode** - Any barcode present on the label

For each element you find, return a bounding box with descriptive label.

IMPORTANT: Return your response as a valid JSON array with this exact structure:
[
  {
    "label": "Brand Name: Example Brand",
    "box_2d": [y_min, x_min, y_max, x_max]
  }
]

The box_2d coordinates should be in [y_min, x_min, y_max, x_max] format, normalized to a 0-1000 scale where (0,0) is the top-left corner.

Only include elements that are clearly visible on the label. If an element cannot be found, do not include it in the array.

Return ONLY the JSON array, no additional text or markdown formatting.`;

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GOOGLE_API_KEY;
}

/**
 * Get Gemini client instance
 * Returns null if not configured
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Parse JSON response from Gemini, handling potential formatting issues
 */
function parseJsonResponse(content: string): BoundingBox[] {
  let cleanContent = content.trim();

  // Handle ```json ... ``` formatting
  if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```$/, "");
  }

  try {
    const parsed = JSON.parse(cleanContent);
    // Validate the structure
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }
    return parsed.map((item: unknown) => {
      const obj = item as Record<string, unknown>;
      if (
        typeof obj.label !== "string" ||
        !Array.isArray(obj.box_2d) ||
        obj.box_2d.length !== 4
      ) {
        throw new Error("Invalid bounding box structure");
      }
      return {
        label: obj.label,
        box_2d: obj.box_2d as [number, number, number, number],
      };
    });
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", content);
    throw new Error(
      `Invalid JSON response from Gemini: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Convert image URL or base64 to the format expected by Gemini
 */
async function prepareImageForGemini(
  imageDataUrl: string
): Promise<{ inlineData: { mimeType: string; data: string } }> {
  // If it's already a data URL, extract the parts
  if (imageDataUrl.startsWith("data:")) {
    const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      return {
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      };
    }
    throw new Error("Invalid data URL format");
  }

  // If it's an HTTP URL, fetch and convert to base64
  const response = await fetch(imageDataUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return {
    inlineData: {
      mimeType: contentType,
      data: base64,
    },
  };
}

/**
 * Detect bounding boxes on a label image using Gemini
 *
 * @param imageDataUrl - Base64 data URL of the image (e.g., "data:image/jpeg;base64,...")
 * @returns Bounding box detection results
 */
export async function detectBoundingBoxes(
  imageDataUrl: string
): Promise<BoundingBoxResult> {
  const startTime = Date.now();
  const client = getGeminiClient();

  if (!client) {
    console.warn("GOOGLE_API_KEY not configured, returning mock result");
    return getMockBoundingBoxResult(startTime);
  }

  try {
    const imagePart = await prepareImageForGemini(imageDataUrl);

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: TTB_DETECTION_PROMPT }, imagePart],
        },
      ],
    });

    const processingTimeMs = Date.now() - startTime;

    // Extract content from response
    const rawResponse = response.text || "";

    if (!rawResponse) {
      throw new Error("No response content from Gemini");
    }

    // Parse the JSON response
    const boxes = parseJsonResponse(rawResponse);

    return {
      boxes,
      processingTimeMs,
      modelVersion: GEMINI_MODEL,
      rawResponse,
    };
  } catch (error) {
    const processingTimeMs = Date.now() - startTime;
    console.error("Gemini bounding box detection failed:", error);

    return {
      boxes: [],
      processingTimeMs,
      modelVersion: GEMINI_MODEL,
      rawResponse: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Convert normalized coordinates (0-1000) to pixel coordinates
 */
export function convertToPixelCoordinates(
  box: BoundingBox,
  imageWidth: number,
  imageHeight: number
): {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const [yMin, xMin, yMax, xMax] = box.box_2d;

  return {
    label: box.label,
    x: Math.round((xMin / 1000) * imageWidth),
    y: Math.round((yMin / 1000) * imageHeight),
    width: Math.round(((xMax - xMin) / 1000) * imageWidth),
    height: Math.round(((yMax - yMin) / 1000) * imageHeight),
  };
}

/**
 * Generate mock bounding box result for demo/testing
 */
function getMockBoundingBoxResult(startTime: number): BoundingBoxResult {
  const processingTimeMs = Date.now() - startTime + 500;

  return {
    boxes: [
      { label: "Brand Name: Demo Brand", box_2d: [50, 100, 150, 400] },
      { label: "Class/Type: Blended Whiskey", box_2d: [160, 100, 200, 350] },
      { label: "Alcohol Content: 40% Alc./Vol.", box_2d: [210, 100, 250, 280] },
      { label: "Net Contents: 750 mL", box_2d: [260, 100, 300, 220] },
      {
        label: "Government Warning",
        box_2d: [600, 50, 850, 450],
      },
      {
        label: "Bottler: Demo Distillery Co.",
        box_2d: [860, 50, 920, 400],
      },
      { label: "Country of Origin: USA", box_2d: [930, 50, 970, 200] },
    ],
    processingTimeMs,
    modelVersion: "mock-demo",
    rawResponse: JSON.stringify([
      { label: "Brand Name: Demo Brand", box_2d: [50, 100, 150, 400] },
    ]),
  };
}
