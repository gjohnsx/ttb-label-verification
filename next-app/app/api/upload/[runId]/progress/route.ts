/**
 * GET /api/upload/[runId]/progress
 *
 * Polling endpoint for upload progress.
 * Returns the latest status for each application in the upload run.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { ProgressUpdate } from "@/lib/csv/types";

export const dynamic = "force-dynamic";

function mapStatus(status: string): ProgressUpdate["status"] {
  switch (status) {
    case "PENDING":
      return "QUEUED";
    case "PROCESSING":
      return "PROCESSING";
    case "READY":
      return "READY";
    case "NEEDS_ATTENTION":
      return "NEEDS_ATTENTION";
    case "ERROR":
      return "ERROR";
    case "REVIEWED":
      return "READY";
    default:
      return "ERROR";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  const applications = await prisma.application.findMany({
    where: { uploadRunId: runId },
    select: {
      id: true,
      brandName: true,
      status: true,
      createdAt: true,
      uploadRunStatus: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalRows = applications.length;
  const items: ProgressUpdate[] = applications.map((app, index) => ({
    applicationId: app.id,
    brandName: app.brandName,
    status: app.uploadRunStatus === "SKIPPED" ? "SKIPPED" : mapStatus(app.status),
    index: index + 1,
    total: totalRows,
  }));

  const processedRows = items.filter(
    (item) => item.status !== "QUEUED" && item.status !== "PROCESSING"
  ).length;

  const isComplete = totalRows > 0 && processedRows >= totalRows;

  return NextResponse.json({
    success: true,
    totalRows,
    processedRows,
    isComplete,
    items,
  });
}
