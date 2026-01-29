/**
 * POST /api/upload/[runId]/process
 *
 * Processes the next pending application for the upload run.
 */

import { NextResponse } from "next/server";
import { processNextApplication } from "@/lib/csv/importer";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const result = await processNextApplication(runId);

  return NextResponse.json({
    success: true,
    processedCount: result.processedCount,
    applicationId: result.applicationId ?? null,
  });
}
