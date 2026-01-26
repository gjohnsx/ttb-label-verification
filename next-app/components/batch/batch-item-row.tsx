"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Circle,
  Loader2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

// Batch processing status for individual items
export type BatchItemStatus =
  | "QUEUED"
  | "PROCESSING"
  | "READY"
  | "NEEDS_ATTENTION"
  | "ERROR";

// Status colors matching the queue status colors from columns.tsx
const statusColors: Record<BatchItemStatus, string> = {
  QUEUED: "bg-treasury-base-light text-treasury-base-darkest",
  PROCESSING: "bg-treasury-primary-light text-white",
  READY: "bg-treasury-secondary-light text-white",
  NEEDS_ATTENTION: "bg-treasury-accent text-treasury-base-darkest",
  ERROR: "bg-treasury-warning text-white",
};

// Human-readable status labels
const statusLabels: Record<BatchItemStatus, string> = {
  QUEUED: "Queued",
  PROCESSING: "Processing",
  READY: "Ready",
  NEEDS_ATTENTION: "Needs Attention",
  ERROR: "Error",
};

// Status icons
function StatusIcon({ status }: { status: BatchItemStatus }) {
  switch (status) {
    case "QUEUED":
      return <Circle className="h-4 w-4 text-treasury-base-dark" />;
    case "PROCESSING":
      return (
        <Loader2 className="h-4 w-4 text-treasury-primary animate-spin" />
      );
    case "READY":
      return <CheckCircle className="h-4 w-4 text-treasury-secondary" />;
    case "NEEDS_ATTENTION":
      return <AlertTriangle className="h-4 w-4 text-treasury-accent" />;
    case "ERROR":
      return <XCircle className="h-4 w-4 text-treasury-warning" />;
  }
}

export interface BatchItem {
  id: string;
  brandName: string;
  status: BatchItemStatus;
}

interface BatchItemRowProps {
  item: BatchItem;
}

export function BatchItemRow({ item }: BatchItemRowProps) {
  const isReviewable =
    item.status === "READY" || item.status === "NEEDS_ATTENTION";

  return (
    <div className="flex items-center justify-between py-2.5 px-3 border-b border-treasury-base-lighter last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <StatusIcon status={item.status} />
        <span className="text-sm font-medium text-treasury-ink truncate">
          {item.brandName}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isReviewable ? (
          <Button variant="primary-outline" size="sm" asChild>
            <Link href={`/review/${item.id}`}>Review</Link>
          </Button>
        ) : (
          <Badge className={statusColors[item.status]} variant="default">
            {statusLabels[item.status]}
          </Badge>
        )}
      </div>
    </div>
  );
}
