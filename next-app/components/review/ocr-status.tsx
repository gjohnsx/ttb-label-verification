"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Play, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OcrStatusProps = {
  applicationId: string;
  hasOcrResults: boolean;
  processedAt?: Date | null;
  isProcessing?: boolean;
  className?: string;
};

export function OcrStatus({
  applicationId,
  hasOcrResults,
  processedAt,
  isProcessing: initialProcessing = false,
  className,
}: OcrStatusProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(initialProcessing);
  const [error, setError] = useState<string | null>(null);

  const loading = isPending || isProcessing;

  async function triggerOcr() {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${applicationId}/ocr`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OCR processing failed");
      }

      // Refresh the page to show new OCR results
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR processing failed");
    } finally {
      setIsProcessing(false);
    }
  }

  // Processing state
  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 border border-treasury-accent bg-treasury-accent-lightest px-3 py-2",
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin text-treasury-accent-dark" />
        <span className="text-sm font-medium text-treasury-accent-dark">
          Processing OCR...
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 border border-treasury-warning bg-treasury-warning-lightest px-3 py-2",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-treasury-warning-dark" />
          <span className="text-sm text-treasury-warning-dark">{error}</span>
        </div>
        <Button
          variant="primary-outline"
          size="sm"
          onClick={triggerOcr}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  // No OCR results - show Run OCR button
  if (!hasOcrResults) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 border border-treasury-base bg-treasury-base-lightest px-3 py-2",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-treasury-base-dark" />
          <span className="text-sm text-treasury-base-dark">
            No OCR results available
          </span>
        </div>
        <Button
          variant="primary-outline"
          onClick={triggerOcr}
        >
          <Play className="mr-1.5 h-3.5 w-3.5" />
          Run OCR
        </Button>
      </div>
    );
  }

  // Has OCR results - show status with re-run option
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border border-treasury-secondary bg-treasury-secondary-lightest px-3 py-2",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-treasury-secondary-dark" />
        <span className="text-sm text-treasury-secondary-dark">
          OCR completed
          {processedAt && (
            <span className="ml-1 text-treasury-base-dark">
              ({formatRelativeTime(processedAt)})
            </span>
          )}
        </span>
      </div>
      <Button
        variant="base"
        onClick={triggerOcr}
      >
        <RefreshCw className="mr-1.5 size-4" />
        Re-run OCR
      </Button>
    </div>
  );
}

/**
 * Format a date as a relative time string
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Skeleton loader for OCR processing state
 */
export function OcrStatusSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border border-treasury-accent bg-treasury-accent-lightest px-3 py-2",
        className
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin text-treasury-accent-dark" />
      <span className="text-sm font-medium text-treasury-accent-dark">
        Loading OCR status...
      </span>
    </div>
  );
}
