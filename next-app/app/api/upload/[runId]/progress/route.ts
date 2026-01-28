/**
 * GET /api/upload/[runId]/progress
 *
 * Server-Sent Events (SSE) endpoint for streaming workflow progress.
 * Clients can connect to receive real-time updates as applications are processed.
 */

import { NextRequest } from "next/server";
import { getRun } from "workflow/api";
import type { ProgressUpdate } from "@/lib/csv/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  // Get the startIndex from query params for resumability
  const { searchParams } = new URL(request.url);
  const startIndexParam = searchParams.get("startIndex");
  const startIndex = startIndexParam ? parseInt(startIndexParam, 10) : undefined;

  // Get the workflow run
  const run = getRun(runId);

  // Get the readable stream, optionally starting from a specific index
  const readable = run.getReadable({ startIndex });

  // Transform the stream to SSE format
  const encoder = new TextEncoder();
  const transformedStream = new ReadableStream({
    async start(controller) {
      const reader = readable.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Send a completion event
            controller.enqueue(
              encoder.encode(`event: complete\ndata: {}\n\n`)
            );
            controller.close();
            break;
          }

          // Convert the value to SSE format
          // The value should be a ProgressUpdate object
          const data = JSON.stringify(value);
          controller.enqueue(
            encoder.encode(`data: ${data}\n\n`)
          );
        }
      } catch (error) {
        console.error("SSE stream error:", error);
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(transformedStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
