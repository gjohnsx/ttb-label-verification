import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { SummaryContentAsync } from "./summary-content-async";
import Loading from "./loading";

type SummaryPageProps = {
  searchParams: Promise<{
    runId?: string;
    total?: string;
    skipped?: string;
    ids?: string;
  }>;
};

export default async function UploadSummaryPage({ searchParams }: SummaryPageProps) {
  const params = await searchParams;
  const total = params.total ? parseInt(params.total, 10) : 0;
  const skippedCount = params.skipped ? parseInt(params.skipped, 10) : 0;
  const applicationIds = params.ids ? params.ids.split(",") : [];

  return (
    <>
      <AppHeader />
      <main className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Suspense fallback={<SummarySkeleton />}>
            <SummaryContentAsync
              runId={params.runId}
              total={total}
              skippedCount={skippedCount}
              applicationIds={applicationIds}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}

function SummarySkeleton() {
  return (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="h-6 w-40 mx-auto mb-2 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 mx-auto bg-muted animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border bg-card shadow-sm">
            <div className="p-4 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="p-4 pt-2">
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
        <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
      </div>
    </>
  );
}
