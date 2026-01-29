"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewSummary } from "./review-summary";
import { ComparisonTable } from "./comparison-table";
import { OcrRawViewer, type OcrResultData } from "./ocr-raw-viewer";
import { GovernmentWarningCheck } from "./government-warning-check";
import { LabelChecklist } from "./label-checklist";
import type {
  ComparisonResult,
  ExtractedFields,
  FieldType,
} from "@/lib/comparison/types";

type ReviewTabsProps = {
  comparison: ComparisonResult;
  applicationId: string;
  colaId?: string | null;
  productType?: string | null;
  sourceType?: string | null;
  permitNumber?: string | null;
  serialNumber?: string | null;
  ocrConfidenceScores?: Partial<Record<FieldType, number>>;
  ocrPendingLabel?: string;
  ocrResults: OcrResultData[];
  governmentWarningOcr?: string | null;
};

export function ReviewTabs({
  comparison,
  applicationId,
  colaId,
  productType,
  sourceType,
  permitNumber,
  serialNumber,
  ocrConfidenceScores,
  ocrPendingLabel,
  ocrResults,
  governmentWarningOcr,
}: ReviewTabsProps) {
  // Government warning has its own dedicated section — exclude from table and summary
  const tableFields = comparison.fields.filter(
    (f) => f.field !== "governmentWarning"
  );

  const relevantFields = tableFields.filter((f) => f.status !== "CONTEXT");
  const mismatchCount = relevantFields.filter(
    (f) => f.status === "MISMATCH" && f.confidence !== "LOW"
  ).length;
  const likelyMatchCount = relevantFields.filter(
    (f) => f.status === "LIKELY_MATCH"
  ).length;
  const missingCount = relevantFields.filter(
    (f) => f.status === "MISSING" && f.applicationValue
  ).length;
  const overallStatus = mismatchCount > 0
    ? "MISMATCH" as const
    : (likelyMatchCount > 0 || missingCount > 0)
      ? "NEEDS_REVIEW" as const
      : "MATCH" as const;

  const tableSummary: ComparisonResult = {
    ...comparison,
    fields: tableFields,
    matchCount: relevantFields.filter((f) => f.status === "MATCH").length,
    mismatchCount,
    missingCount,
    likelyMatchCount,
    overallStatus,
  };

  return (
    <Tabs defaultValue="comparison" className="w-full">
      <TabsList variant="uswds" className="w-full">
        <TabsTrigger value="comparison">Comparison</TabsTrigger>
        <TabsTrigger value="full-ocr">Full OCR</TabsTrigger>
        <TabsTrigger value="checklist">Checklist</TabsTrigger>
      </TabsList>

      <TabsContent value="comparison" className="mt-6">
        <div className="border bg-gray-50 shadow-sm p-6">
          <ReviewSummary
            comparison={tableSummary}
            applicationId={applicationId}
            colaId={colaId}
            productType={productType}
            sourceType={sourceType}
            permitNumber={permitNumber}
            serialNumber={serialNumber}
          />
        </div>

        <ComparisonTable
          fields={tableFields}
          ocrConfidenceScores={ocrConfidenceScores}
          ocrPendingLabel={ocrPendingLabel}
          className="mt-4"
        />

        {/* Government Warning — separate presence/correctness check */}
        <div className="mt-4" />
        <GovernmentWarningCheck
          ocrValue={governmentWarningOcr ?? null}
          ocrConfidence={ocrConfidenceScores?.governmentWarning}
        />
      </TabsContent>

      <TabsContent value="full-ocr" className="mt-6">
        <OcrRawViewer ocrResults={ocrResults} />
      </TabsContent>

      <TabsContent value="checklist" className="mt-6">
        <LabelChecklist productType={productType} sourceType={sourceType} />
      </TabsContent>
    </Tabs>
  );
}
