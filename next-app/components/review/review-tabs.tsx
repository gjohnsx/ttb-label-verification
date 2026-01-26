"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewSummary } from "./review-summary";
import { ComparisonTable } from "./comparison-table";
import { OcrRawViewer, type OcrResultData } from "./ocr-raw-viewer";
import type {
  ComparisonResult,
  ExtractedFields,
  FieldType,
} from "@/lib/comparison/types";

type ReviewTabsProps = {
  comparison: ComparisonResult;
  applicationId: string;
  colaId?: string | null;
  ocrConfidenceScores?: Partial<Record<FieldType, number>>;
  ocrPendingLabel?: string;
  ocrResults: OcrResultData[];
};

export function ReviewTabs({
  comparison,
  applicationId,
  colaId,
  ocrConfidenceScores,
  ocrPendingLabel,
  ocrResults,
}: ReviewTabsProps) {
  return (
    <Tabs defaultValue="comparison" className="w-full">
      <TabsList variant="uswds" className="w-full">
        <TabsTrigger value="comparison">Comparison</TabsTrigger>
        <TabsTrigger value="full-ocr">Full OCR</TabsTrigger>
      </TabsList>

      <TabsContent value="comparison" className="mt-6 space-y-6">
        <ReviewSummary
          comparison={comparison}
          applicationId={applicationId}
          colaId={colaId}
        />

        <div>
          <h2 className="mb-3 text-lg font-semibold text-treasury-base-darkest">
            Field Comparison
          </h2>
          <ComparisonTable
            fields={comparison.fields}
            ocrConfidenceScores={ocrConfidenceScores}
            ocrPendingLabel={ocrPendingLabel}
          />
        </div>
      </TabsContent>

      <TabsContent value="full-ocr" className="mt-6">
        <OcrRawViewer ocrResults={ocrResults} />
      </TabsContent>
    </Tabs>
  );
}
