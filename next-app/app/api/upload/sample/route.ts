/**
 * GET /api/upload/sample
 *
 * Returns a sample CSV file for demo purposes.
 */

import { NextResponse } from "next/server";
import { generateSampleCsv } from "@/lib/csv/sample-data";

export async function GET() {
  const csv = generateSampleCsv();

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="ttb-demo-applications.csv"',
    },
  });
}
