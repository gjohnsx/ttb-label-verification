import { notFound } from "next/navigation";
import {
  getApplicationForReview,
  toApplicationData,
  extractOcrFields,
  hasOcrResults,
  getOcrProcessedAt,
} from "@/lib/queries/reviews";
import { compareApplication } from "@/lib/comparison/compare";
import { ImageGallery, type LabelImage } from "@/components/review/image-gallery";
import { ReviewTabs } from "@/components/review/review-tabs";
import type { OcrResultData } from "@/components/review/ocr-raw-viewer";
import { OcrStatus } from "@/components/review/ocr-status";

type ReviewContentAsyncProps = {
  id: string;
};

export async function ReviewContentAsync({ id }: ReviewContentAsyncProps) {
  // Fetch application data
  const application = await getApplicationForReview(id);

  if (!application) {
    notFound();
  }

  // Check if OCR results exist
  const ocrAvailable = hasOcrResults(application);
  const ocrFields = extractOcrFields(application);
  const ocrProcessedAt = ocrAvailable ? await getOcrProcessedAt(id) : null;

  // Convert application to comparison format
  const applicationData = toApplicationData(application);

  const comparison = compareApplication(applicationData, ocrFields ?? {});

  // Check if application is currently processing OCR
  const isProcessing = application.status === "PROCESSING";
  const ocrPendingLabel = !ocrAvailable
    ? isProcessing
      ? "Processing OCR..."
      : "Awaiting OCR"
    : undefined;

  // Convert label images to the format expected by the carousel
  const labelImages: LabelImage[] = application.labelImages.map((img) => ({
    id: img.id,
    blobUrl: img.blobUrl,
    imageType: img.imageType,
  }));

  // Extract OCR results with image metadata for the Full OCR tab
  const ocrResults: OcrResultData[] = application.labelImages.map((img) => ({
    imageId: img.id,
    imageType: img.imageType,
    rawMarkdown: img.ocrResults[0]?.rawMarkdown ?? null,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[40%_1fr]">
      {/* Left Panel: Image Gallery */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="mb-3 text-lg font-semibold text-treasury-base-darkest">
          Label Images
        </h2>
        <ImageGallery images={labelImages} />
      </div>

      {/* Right Panel: Summary + Comparison Table */}
      <div className="space-y-6">
        {/* OCR Status */}
        <OcrStatus
          applicationId={id}
          hasOcrResults={ocrAvailable}
          processedAt={ocrProcessedAt}
          isProcessing={isProcessing}
        />

        {/* Tabbed Content: Comparison + Full OCR */}
        <ReviewTabs
          comparison={comparison}
          applicationId={id}
          colaId={application.colaId}
          ocrConfidenceScores={ocrFields?.confidenceScores}
          ocrPendingLabel={ocrPendingLabel}
          ocrResults={ocrResults}
        />
      </div>
    </div>
  );
}

// Export displayId getter for breadcrumb
export async function getDisplayId(id: string): Promise<string> {
  const application = await getApplicationForReview(id);
  if (!application) return `APP-${id.slice(0, 8).toUpperCase()}`;
  return application.colaId || `APP-${id.slice(0, 8).toUpperCase()}`;
}
