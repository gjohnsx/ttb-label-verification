import { cn } from "@/lib/utils";
import type { ComparisonResult, OverallStatus, FieldComparison } from "@/lib/comparison/types";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon, AlertTriangleIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type ReviewSummaryProps = {
  comparison: ComparisonResult;
  applicationId: string;
  colaId?: string | null;
  productType?: string | null;
  sourceType?: string | null;
  permitNumber?: string | null;
  serialNumber?: string | null;
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
    icon: CheckIcon,
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
    icon: XIcon,
    bgClass: "bg-treasury-warning-lightest",
    textClass: "text-treasury-warning-dark",
    borderClass: "border-treasury-warning",
  },
};

// Human-readable field names
const FIELD_LABELS: Record<string, string> = {
  brandName: "Brand Name",
  classType: "Class/Type (TTB)",
  alcoholContent: "Alcohol Content",
  netContents: "Net Contents",
  governmentWarning: "Government Warning",
  bottlerName: "Applicant Name",
  bottlerAddress: "Applicant Address",
  countryOfOrigin: "Country of Origin",
};

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field;
}

function getCriticalMismatches(fields: FieldComparison[]): FieldComparison[] {
  return fields.filter((f) => f.status === "MISMATCH" && f.confidence !== "LOW");
}

function getLikelyMatches(fields: FieldComparison[]): FieldComparison[] {
  return fields.filter((f) => f.status === "LIKELY_MATCH");
}

function getMissingFields(fields: FieldComparison[]): FieldComparison[] {
  return fields.filter((f) => f.status === "MISSING" && f.applicationValue);
}

export function ReviewSummary({
  comparison,
  applicationId,
  colaId,
  productType,
  sourceType,
  permitNumber,
  serialNumber,
}: ReviewSummaryProps) {
  const config = STATUS_CONFIG[comparison.overallStatus];
  const Icon = config.icon;

  const totalFields = comparison.fields.filter((f) => f.status !== "CONTEXT").length;
  const matchCount = comparison.matchCount + comparison.likelyMatchCount;

  const criticalMismatches = getCriticalMismatches(comparison.fields);
  const likelyMatches = getLikelyMatches(comparison.fields);
  const missingFields = getMissingFields(comparison.fields);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status and Metrics */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border-2",
              config.bgClass,
              config.borderClass,
              config.textClass
            )}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-treasury-base-darkest">
              {config.label}
            </h3>
            <p className="text-sm text-treasury-base-dark">
              <span className="font-semibold text-treasury-base-darkest">{matchCount}</span> of{" "}
              <span className="font-semibold text-treasury-base-darkest">{totalFields}</span> fields match
            </p>
          </div>
        </div>

        {/* Application ID */}
        <div className="text-right text-sm text-treasury-base-dark">
          <div className="font-mono text-xs uppercase tracking-wide text-treasury-base-lighter mb-1">Application ID</div>
          <div className="font-mono font-medium text-treasury-base-darkest">
            {colaId || `APP-${applicationId.slice(0, 8)}`}
          </div>
        </div>
      </div>

      {(productType || sourceType || permitNumber || serialNumber) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-treasury-base-dark">
          {productType && (
            <Badge variant="outline">Product: {productType}</Badge>
          )}
          {sourceType && (
            <Badge variant="outline">Source: {sourceType}</Badge>
          )}
          {permitNumber && (
            <Badge variant="outline">Permit: {permitNumber}</Badge>
          )}
          {serialNumber && (
            <Badge variant="outline">Serial: {serialNumber}</Badge>
          )}
        </div>
      )}

      {/* Critical Issues Only */}
      {criticalMismatches.length > 0 && (
        <Alert variant="error">
          <AlertTitle>Critical mismatches detected</AlertTitle>
          <AlertDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              {criticalMismatches.map((field) => (
                <Badge
                  key={field.field}
                  variant="outline"
                  className="bg-white text-treasury-warning-dark border-treasury-warning/20 text-xs font-medium"
                >
                  {getFieldLabel(field.field)}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
