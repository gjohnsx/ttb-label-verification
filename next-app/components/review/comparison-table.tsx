"use client";

import { cn } from "@/lib/utils";
import type { FieldComparison, FieldType } from "@/lib/comparison/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FieldStatusBadge, ConfidenceChip } from "./field-status-badge";
import { AlertTriangle } from "lucide-react";

type ComparisonTableProps = {
  fields: FieldComparison[];
  /** OCR confidence scores keyed by field name */
  ocrConfidenceScores?: Partial<Record<FieldType, number>>;
  /** Optional label to show when OCR values are not yet available */
  ocrPendingLabel?: string;
  className?: string;
};

/** Threshold below which OCR confidence is considered low */
const LOW_CONFIDENCE_THRESHOLD = 0.7;

// Human-readable field names
const FIELD_LABELS: Record<FieldType, string> = {
  brandName: "Brand Name",
  classType: "Class/Type (TTB)",
  alcoholContent: "Alcohol Content",
  netContents: "Net Contents",
  governmentWarning: "Government Warning",
  bottlerName: "Applicant Name",
  bottlerAddress: "Applicant Address",
  countryOfOrigin: "Country of Origin",
};

// Maximum length before truncation
const TRUNCATE_LENGTH = 30;

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Value cell that truncates long text and shows full content in a hover card
 */
function ValueCell({
  value,
  fieldLabel,
  isLowConfidence,
  emptyLabel,
}: {
  value: string | null;
  fieldLabel: string;
  isLowConfidence?: boolean;
  emptyLabel?: string;
}) {
  if (!value) {
    return (
      <span className="text-treasury-base-lighter select-none" title={emptyLabel ?? "Not provided"}>
        {emptyLabel ?? "\u2014"}
      </span>
    );
  }

  const isLong = value.length > TRUNCATE_LENGTH;
  const displayText = isLong ? truncateText(value, TRUNCATE_LENGTH) : value;

  const textElement = (
    <span
      className={cn(
        "text-treasury-base-darkest whitespace-nowrap",
        isLowConfidence && "bg-treasury-accent-lightest px-1",
        isLong && "cursor-help underline decoration-dotted underline-offset-2"
      )}
    >
      {displayText}
    </span>
  );

  if (!isLong) {
    return textElement;
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>{textElement}</HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-96 max-h-64 overflow-y-auto"
      >
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-treasury-base-dark">
            {fieldLabel}
          </p>
          <p className="text-sm text-treasury-base-darkest whitespace-pre-wrap">
            {value}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * OCR confidence indicator with tooltip
 */
function OcrConfidenceIndicator({
  confidence,
  fieldName,
}: {
  confidence: number;
  fieldName: string;
}) {
  const isLow = confidence < LOW_CONFIDENCE_THRESHOLD;
  const percentage = Math.round(confidence * 100);

  if (!isLow) {
    return (
      <span className="text-[10px] text-treasury-secondary-dark font-medium">
        {percentage}%
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 text-[10px] text-treasury-accent-dark font-medium cursor-help">
            <AlertTriangle className="h-3 w-3" />
            {percentage}%
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-xs">
            Low OCR confidence for {fieldName}. Manual verification recommended.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ComparisonRow({
  field,
  ocrConfidence,
  ocrPendingLabel,
}: {
  field: FieldComparison;
  ocrConfidence?: number;
  ocrPendingLabel?: string;
}) {
  const label = FIELD_LABELS[field.field];
  const showAppMissingNote =
    (field.field === "alcoholContent" || field.field === "netContents") &&
    !field.applicationValue;
  const isLowConfidence =
    ocrConfidence !== undefined && ocrConfidence < LOW_CONFIDENCE_THRESHOLD;

  return (
    <TableRow className={cn(isLowConfidence && "bg-treasury-accent-lightest/30")}>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell>
        <ValueCell
          value={field.applicationValue}
          fieldLabel={`${label} (Application)`}
          emptyLabel={showAppMissingNote ? "Not on application" : undefined}
        />
      </TableCell>
      <TableCell>
        <ValueCell
          value={field.ocrValue}
          fieldLabel={`${label} (Label)`}
          isLowConfidence={isLowConfidence}
          emptyLabel={ocrPendingLabel}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <FieldStatusBadge status={field.status} />
          {field.status !== "MISSING" && field.status !== "CONTEXT" && (
            <ConfidenceChip confidence={field.confidence} />
          )}
          {ocrConfidence !== undefined && (
            <OcrConfidenceIndicator
              confidence={ocrConfidence}
              fieldName={label}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ComparisonTable({
  fields,
  ocrConfidenceScores,
  ocrPendingLabel,
  className,
}: ComparisonTableProps) {
  return (
    <div className={cn("bg-card overflow-hidden", className)}>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Field</TableHead>
            <TableHead>Application Value</TableHead>
            <TableHead>Label Value</TableHead>
            <TableHead className="w-[200px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => {
            const ocrConfidence = ocrConfidenceScores?.[field.field];
            return (
              <ComparisonRow
                key={field.field}
                field={field}
                ocrConfidence={ocrConfidence}
                ocrPendingLabel={ocrPendingLabel}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Skeleton loader for comparison table
 */
export function ComparisonTableSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card overflow-hidden", className)}>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Field</TableHead>
            <TableHead>Application Value</TableHead>
            <TableHead>Label Value</TableHead>
            <TableHead className="w-[200px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 w-24 animate-pulse bg-treasury-base-lighter" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-32 animate-pulse bg-treasury-base-lighter" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-32 animate-pulse bg-treasury-base-lighter" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-20 animate-pulse bg-treasury-base-lighter" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
