"use client";

import { useEffect, useRef, useState } from "react";
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
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
  SkipForward,
  Info,
} from "lucide-react";
import type { ProgressUpdate } from "@/lib/csv/types";
import { DataBox } from "@/components/data-box";

type ApplicationProgress = ProgressUpdate & {
  receivedAt: Date;
};

type UploadProgressModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId?: string | null;
  totalRows?: number;
  preflight?: {
    status: "idle" | "parsing" | "uploading" | "error" | "done";
    totalRows?: number | null;
  };
  onComplete: (stats: { skippedCount: number; applicationIds: string[] }) => void;
  onProcessingDone?: () => void;
};

export function UploadProgressModal({
  open,
  onOpenChange,
  runId,
  totalRows = 0,
  preflight,
  onComplete,
  onProcessingDone,
}: UploadProgressModalProps) {
  const [applications, setApplications] = useState<Map<string, ApplicationProgress>>(
    new Map()
  );
  const [isComplete, setIsComplete] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const processInFlightRef = useRef<Promise<void> | null>(null);
  const isPreparing = !runId;
  const preflightStatus = preflight?.status ?? "idle";
  const preflightRows = preflight?.totalRows ?? null;

  const parsingDone =
    preflightStatus === "uploading" || preflightStatus === "done";
  const uploadingDone = preflightStatus === "done";

  const getPreflightIcon = (state: "idle" | "active" | "done" | "error") => {
    switch (state) {
      case "active":
        return <Loader2 className="h-4 w-4 animate-spin text-treasury-primary" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

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

    let isCancelled = false;
    let isTicking = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      if (isCancelled || isTicking) return;
      isTicking = true;
      try {
        if (!processInFlightRef.current) {
          processInFlightRef.current = fetch(`/api/upload/${runId}/process`, {
            method: "POST",
            cache: "no-store",
          })
            .then(() => undefined)
            .catch((error) => {
              console.error("Process request error:", error);
            })
            .finally(() => {
              processInFlightRef.current = null;
            });
        }

        const response = await fetch(`/api/upload/${runId}/progress`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!data?.success || isCancelled) return;

        const items: ProgressUpdate[] = data.items ?? [];

        setApplications(() => {
          const next = new Map<string, ApplicationProgress>();
          items.forEach((item) => {
            next.set(item.applicationId, {
              ...item,
              receivedAt: new Date(),
            });
          });
          return next;
        });

        const complete = Boolean(data.isComplete);
        setIsComplete(complete);
        setConnectionError(null);

        if (complete && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (error) {
        if (isCancelled) return;
        console.error("Progress polling error:", error);
        setConnectionError("Connection lost. Keep this tab open to continue processing.");
      } finally {
        isTicking = false;
      }
    };

    tick();
    intervalId = setInterval(tick, 1500);

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [runId]);

  // Auto-complete detection based on processed count (fallback)
  useEffect(() => {
    if (processedCount >= totalRows && totalRows > 0 && !isComplete) {
      const timer = setTimeout(() => {
        setIsComplete(true);
      }, 500);
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
            {isComplete ? "Upload Complete" : isPreparing ? "Preparing Upload" : "Processing Upload"}
          </SheetTitle>
          <SheetDescription>
            {isComplete
              ? `Processed ${totalRows} applications`
              : isPreparing
                ? "Validating CSV and creating application records…"
                : `Processing ${processedCount} of ${totalRows} applications`}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pt-2 pb-4 space-y-3 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <Progress value={isPreparing ? 5 : progressPercent} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{isPreparing ? "Preparing…" : `${processedCount} processed`}</span>
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
          <ScrollArea className="flex-1 min-h-0 overflow-hidden">
            <div className="space-y-2 pr-4">
              {isPreparing && (
                <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    {getPreflightIcon(
                      preflightStatus === "parsing"
                        ? "active"
                        : preflightStatus === "error"
                          ? "error"
                          : parsingDone
                            ? "done"
                            : "idle"
                    )}
                    <div className="flex items-baseline gap-2">
                      <span>Parse & validate CSV</span>
                      {preflightRows ? (
                        <span className="text-xs text-muted-foreground">
                          ({preflightRows} rows)
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPreflightIcon(
                      preflightStatus === "uploading"
                        ? "active"
                        : preflightStatus === "error"
                          ? "error"
                          : uploadingDone
                            ? "done"
                            : "idle"
                    )}
                    <span>Create application records</span>
                  </div>
                  {preflightStatus === "error" && (
                    <p className="text-xs text-red-600">
                      Upload failed during preparation. Check the error message above.
                    </p>
                  )}
                </div>
              )}

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

              {!isPreparing && applications.size === 0 && (
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
            <div className="w-full space-y-1">
              <Button variant="primary-outline" onClick={() => onOpenChange(false)} className="w-full">
                Hide
              </Button>
              <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <span>Processing continues while this tab stays open.</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground"
                      aria-label="Why this approach?"
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="center">
                    <PopoverHeader>
                      <PopoverTitle>Why this MVP flow?</PopoverTitle>
                      <PopoverDescription>
                        Azure Static Web Apps API routes are short‑lived, so we process one label at a
                        time and poll for status. It’s Azure‑native and requires no extra infrastructure.
                        If Vercel were allowed, I’d use the{" "}
                        <a
                          href="https://useworkflow.dev/"
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2"
                        >
                          Workflow DevKit
                        </a>{" "}
                        for durable, streaming background jobs.
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
