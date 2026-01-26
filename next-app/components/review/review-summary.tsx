import { cn } from "@/lib/utils";
import type { ComparisonResult, OverallStatus, FieldComparison } from "@/lib/comparison/types";
import { Badge } from "@/components/ui/badge";
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

type ReviewSummaryProps = {
  comparison: ComparisonResult;
  applicationId: string;
  colaId?: string | null;
};

const STATUS_CONFIG: Record<
  OverallStatus,
  {
    label: string;
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  MATCH: {
    label: "Likely OK",
    icon: CheckCircleIcon,
    bgClass: "bg-treasury-secondary-lightest",
    textClass: "text-treasury-secondary-dark",
    borderClass: "border-treasury-secondary",
  },
  NEEDS_REVIEW: {
    label: "Needs Review",
    icon: AlertTriangleIcon,
    bgClass: "bg-treasury-accent-lightest",
    textClass: "text-treasury-accent-dark",
    borderClass: "border-treasury-accent",
  },
  MISMATCH: {
    label: "Issues Found",
    icon: XCircleIcon,
    bgClass: "bg-treasury-warning-lightest",
    textClass: "text-treasury-warning-dark",
    borderClass: "border-treasury-warning",
  },
};

// Human-readable field names
const FIELD_LABELS: Record<string, string> = {
  brandName: "Brand Name",
  classType: "Class/Type",
  alcoholContent: "Alcohol Content",
  netContents: "Net Contents",
  governmentWarning: "Government Warning",
  bottlerName: "Bottler Name",
  bottlerAddress: "Bottler Address",
  countryOfOrigin: "Country of Origin",
};

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field;
}

function getCriticalMismatches(fields: FieldComparison[]): FieldComparison[] {
  return fields.filter((f) => f.status === "MISMATCH");
}

function getLikelyMatches(fields: FieldComparison[]): FieldComparison[] {
  return fields.filter((f) => f.status === "LIKELY_MATCH");
}

function getMissingFields(fields: FieldComparison[]): FieldComparison[] {
  return fields.filter((f) => f.status === "MISSING");
}

export function ReviewSummary({
  comparison,
  applicationId,
  colaId,
}: ReviewSummaryProps) {
  const config = STATUS_CONFIG[comparison.overallStatus];
  const Icon = config.icon;

  const totalFields = comparison.fields.length;
  const matchCount = comparison.matchCount + comparison.likelyMatchCount;

  const criticalMismatches = getCriticalMismatches(comparison.fields);
  const likelyMatches = getLikelyMatches(comparison.fields);
  const missingFields = getMissingFields(comparison.fields);

  return (
    <div
      className={cn(
        "border-2 p-4",
        config.bgClass,
        config.borderClass
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Status Badge and Match Count */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 border px-3 py-1.5 text-sm font-semibold",
                config.bgClass,
                config.textClass,
                config.borderClass
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {config.label}
            </span>
            <span className="text-sm text-treasury-base-darkest">
              <span className="font-semibold">{matchCount}</span> of{" "}
              <span className="font-semibold">{totalFields}</span> fields match
            </span>
          </div>

          {/* Critical Issues List */}
          {criticalMismatches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-treasury-warning-dark">
                Critical:
              </span>
              {criticalMismatches.map((field) => (
                <Badge
                  key={field.field}
                  variant="destructive"
                  className="text-xs"
                >
                  {getFieldLabel(field.field)}
                </Badge>
              ))}
            </div>
          )}

          {/* Likely Matches */}
          {likelyMatches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-treasury-accent-dark">
                Review:
              </span>
              {likelyMatches.map((field) => (
                <Badge
                  key={field.field}
                  variant="outline"
                  className="border-treasury-accent bg-treasury-accent-lightest text-treasury-accent-dark text-xs"
                >
                  {getFieldLabel(field.field)}
                </Badge>
              ))}
            </div>
          )}

          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-treasury-base-dark">
                Missing:
              </span>
              {missingFields.map((field) => (
                <Badge
                  key={field.field}
                  variant="outline"
                  className="border-treasury-base bg-treasury-base-lightest text-treasury-base-dark text-xs"
                >
                  {getFieldLabel(field.field)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Application ID */}
        <div className="text-right text-sm text-treasury-base-dark">
          <div className="font-mono">
            {colaId || `APP-${applicationId.slice(0, 8)}`}
          </div>
        </div>
      </div>
    </div>
  );
}
