import Link from "next/link";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { getAgent } from "@/lib/dal";
import {
  getApplicationForReview,
  toApplicationData,
  extractOcrFields,
  hasOcrResults,
  getOcrProcessedAt,
} from "@/lib/queries/reviews";
import { compareApplication } from "@/lib/comparison/compare";
import { ReviewSummary } from "@/components/review/review-summary";
import { ComparisonTable } from "@/components/review/comparison-table";
import { ImageGallery, type LabelImage } from "@/components/review/image-gallery";
import { ReviewActionBar } from "@/components/review/review-action-bar";
import { OcrStatus } from "@/components/review/ocr-status";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type ReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const agent = await getAgent();
  const { id } = await params;

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

  const displayId = application.colaId || `APP-${id.slice(0, 8).toUpperCase()}`;

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

  return (
    <>
      <AppHeader agentName={agent.name} agentRole={agent.role} />

      {/* Breadcrumb Navigation - Full width */}
      <Breadcrumb>
        <div className="container mx-auto px-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/queue"
                  className="hover:underline"
                >
                  Queue
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Review: {displayId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </div>
      </Breadcrumb>

      <main className="container mx-auto py-6 px-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-treasury-base-darkest">
            Label Review
          </h1>
          <p className="text-treasury-base-dark">
            Compare application data against extracted label values
          </p>
        </div>

        {/* Split Layout: Images (40%) | Comparison (60%) */}
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

            <div>
              <ReviewSummary
                comparison={comparison}
                applicationId={id}
                colaId={application.colaId}
              />
            </div>

            {/* Comparison Table */}
            <div>
              <h2 className="mb-3 text-lg font-semibold text-treasury-base-darkest">
                Field Comparison
              </h2>
              <ComparisonTable
                fields={comparison.fields}
                ocrConfidenceScores={ocrFields?.confidenceScores}
                ocrPendingLabel={ocrPendingLabel}
              />
            </div>
          </div>
        </div>

        {/* Bottom padding to account for sticky action bar */}
        <div className="h-24" />
      </main>

      {/* Sticky Action Bar */}
      <ReviewActionBar applicationId={id} />
    </>
  );
}
