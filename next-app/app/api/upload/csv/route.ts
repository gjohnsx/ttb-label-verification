/**
 * POST /api/upload/csv
 *
 * Handles CSV file uploads for batch label verification.
 * Parses the CSV, validates it, and starts the import run.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parseCSV } from "@/lib/csv/parser";
import type { CsvUploadResponse } from "@/lib/csv/types";
import { createApplicationsForRun } from "@/lib/csv/importer";

export async function POST(request: NextRequest): Promise<NextResponse<CsvUploadResponse>> {
  try {
    // Get the file from the form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        {
          success: false,
          error: "File must be a CSV file",
        },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Parse and validate CSV
    const parseResult = parseCSV(content);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV validation failed",
          errors: parseResult.errors,
        },
        { status: 400 }
      );
    }

    const runId = randomUUID();
    const { createdCount, skippedCount } = await createApplicationsForRun(
      parseResult.rows,
      runId
    );

    if (createdCount === 0 && skippedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No new applications to process",
          skippedCount,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      runId,
      totalRows: createdCount + skippedCount,
      skippedCount,
    });
  } catch (error) {
    console.error("CSV upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
