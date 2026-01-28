"use client";

import { useEffect, useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
  SkipForward,
} from "lucide-react";
import type { ProgressUpdate } from "@/lib/csv/types";
import { DataBox } from "@/components/data-box";

type ApplicationProgress = ProgressUpdate & {
  receivedAt: Date;
};

type UploadProgressModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: string;
  totalRows: number;
  onComplete: (stats: { skippedCount: number; applicationIds: string[] }) => void;
  onProcessingDone?: () => void;
};

export function UploadProgressModal({
  open,
  onOpenChange,
  runId,
  totalRows,
  onComplete,
  onProcessingDone,
}: UploadProgressModalProps) {
  const [applications, setApplications] = useState<Map<string, ApplicationProgress>>(
    new Map()
  );
  const [isComplete, setIsComplete] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Calculate progress stats
  const processedCount = Array.from(applications.values()).filter(
    (app) => app.status !== "QUEUED" && app.status !== "PROCESSING"
  ).length;
  const progressPercent = totalRows > 0 ? (processedCount / totalRows) * 100 : 0;

  // Count by status
  const readyCount = Array.from(applications.values()).filter(
    (app) => app.status === "READY"
  ).length;
  const needsAttentionCount = Array.from(applications.values()).filter(
    (app) => app.status === "NEEDS_ATTENTION"
  ).length;
  const errorCount = Array.from(applications.values()).filter(
    (app) => app.status === "ERROR"
  ).length;
  const skippedCount = Array.from(applications.values()).filter(
    (app) => app.status === "SKIPPED"
  ).length;

  useEffect(() => {
    if (!runId) return;

    // Connect to SSE endpoint
    const eventSource = new EventSource(`/api/upload/${runId}/progress`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressUpdate = JSON.parse(event.data);

        setApplications((prev) => {
          const next = new Map(prev);
          next.set(data.applicationId, {
            ...data,
            receivedAt: new Date(),
          });
          return next;
        });
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.addEventListener("complete", () => {
      setIsComplete(true);
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setConnectionError("Connection lost. Processing continues in background.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [runId]);

  // Auto-complete detection based on processed count
  useEffect(() => {
    if (processedCount >= totalRows && totalRows > 0 && !isComplete) {
      // Small delay to ensure all updates are received
      const timer = setTimeout(() => {
        setIsComplete(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [processedCount, totalRows, isComplete]);

  // Notify parent when processing is done
  useEffect(() => {
    if (isComplete) {
      onProcessingDone?.();
    }
  }, [isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = (status: ProgressUpdate["status"]) => {
    switch (status) {
      case "QUEUED":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "PROCESSING":
        return <Loader2 className="h-4 w-4 animate-spin text-treasury-primary" />;
      case "READY":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "NEEDS_ATTENTION":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "ERROR":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "SKIPPED":
        return <SkipForward className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ProgressUpdate["status"]) => {
    switch (status) {
      case "QUEUED":
        return <Badge variant="outline">Queued</Badge>;
      case "PROCESSING":
        return <Badge variant="treasury-primary">Processing</Badge>;
      case "READY":
        return <Badge variant="treasury-secondary">Ready</Badge>;
      case "NEEDS_ATTENTION":
        return <Badge variant="treasury-accent">Attention</Badge>;
      case "ERROR":
        return <Badge variant="treasury-warning">Error</Badge>;
      case "SKIPPED":
        return <Badge variant="outline">Skipped</Badge>;
    }
  };

  // Sort applications: processing first, then by index
  const sortedApplications = Array.from(applications.values()).sort((a, b) => {
    const statusOrder = {
      PROCESSING: 0,
      QUEUED: 1,
      READY: 2,
      NEEDS_ATTENTION: 2,
      ERROR: 2,
      SKIPPED: 3,
    };
    const orderDiff = statusOrder[a.status] - statusOrder[b.status];
    if (orderDiff !== 0) return orderDiff;
    return a.index - b.index;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {isComplete ? "Upload Complete" : "Processing Upload"}
          </SheetTitle>
          <SheetDescription>
            {isComplete
              ? `Processed ${totalRows} applications`
              : `Processing ${processedCount} of ${totalRows} applications`}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pt-2 pb-4 space-y-3 flex-1 flex flex-col min-h-0">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{processedCount} processed</span>
              <span>{totalRows} total</span>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex gap-2">
            <DataBox size="xs" label="Ready" value={readyCount} className="flex-1 min-w-0" />
            <DataBox size="xs" label="Attention" value={needsAttentionCount} className="flex-1 min-w-0" />
            <DataBox size="xs" label="Error" value={errorCount} className="flex-1 min-w-0" />
            {skippedCount > 0 && (
              <DataBox size="xs" label="Skipped" value={skippedCount} className="flex-1 min-w-0" />
            )}
          </div>

          {/* Connection Error */}
          {connectionError && (
            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              {connectionError}
            </div>
          )}

          {/* Application List */}
          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="space-y-2">
              {sortedApplications.map((app) => (
                <div
                  key={app.applicationId}
                  className="flex items-center gap-3 p-3 border bg-card"
                >
                  {getStatusIcon(app.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{app.brandName}</p>
                    <p className="text-xs text-muted-foreground">
                      #{app.index} of {app.total}
                    </p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              ))}

              {applications.size === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Waiting for updates...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <SheetFooter>
          {isComplete ? (
            <Button onClick={() => onComplete({
              skippedCount,
              applicationIds: Array.from(applications.values())
                .filter((app) => app.status !== "SKIPPED")
                .map((app) => app.applicationId),
            })} className="w-full">
              View Results
            </Button>
          ) : (
            <Button variant="primary-outline" onClick={() => onOpenChange(false)} className="w-full">
              Run in Background
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
