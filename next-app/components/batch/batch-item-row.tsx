"use client";

import Link from "next/link";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Circle,
  Loader2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { VariantProps } from "class-variance-authority";

// Batch processing status for individual items
export type BatchItemStatus =
  | "QUEUED"
  | "PROCESSING"
  | "READY"
  | "NEEDS_ATTENTION"
  | "ERROR";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

// Map status to treasury badge variants
const statusVariants: Record<BatchItemStatus, BadgeVariant> = {
  QUEUED: "treasury-base",
  PROCESSING: "treasury-primary",
  READY: "treasury-secondary",
  NEEDS_ATTENTION: "treasury-accent",
  ERROR: "treasury-warning",
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
          <Badge variant={statusVariants[item.status]}>
            {statusLabels[item.status]}
          </Badge>
        )}
      </div>
    </div>
  );
}
