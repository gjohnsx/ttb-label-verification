/**
 * GET /api/upload/sample
 *
 * Returns a sample CSV file for demo purposes.
 * Serves the pre-extracted real COLA data from sample-30.csv
 */

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  // Read the static sample CSV file with real COLA data
  const csvPath = join(process.cwd(), "..", "research/dataset/sample-30.csv");
  const csv = readFileSync(csvPath, "utf-8");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="ttb-demo-applications.csv"',
    },
  });
}
