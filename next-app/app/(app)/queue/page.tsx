import { Suspense } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { getAgent } from "@/lib/dal";
import {
  getApplicationsForQueue,
  getNextApplicationToReview,
  type QueueFilters,
} from "@/lib/queries/applications";
import { QueueDataTable } from "./queue-data-table";
import { QueueFiltersToolbar } from "./queue-filters-toolbar";

// Parse URL search params into QueueFilters
function parseSearchParams(params: {
  status?: string;
  classType?: string;
  search?: string;
}): QueueFilters {
  return {
    status: params.status?.split(",").filter(Boolean),
    classType: params.classType?.split(",").filter(Boolean),
    search: params.search || undefined,
  };
}

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; classType?: string; search?: string }>;
}) {
  // This will redirect to / if not authenticated
  const agent = await getAgent();

  // Parse filters from URL search params (async in Next.js 16.1)
  const params = await searchParams;
  const filters = parseSearchParams(params);

  // Fetch applications with priority sorting and filters
  const applications = await getApplicationsForQueue(filters);
  const nextApplication = await getNextApplicationToReview();

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.status?.length ||
    filters.classType?.length ||
    filters.search
  );

  return (
    <>
      <AppHeader agentName={agent.name} agentRole={agent.role} />
      <main className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Application Queue</h1>
            <p className="text-muted-foreground mt-1">
              {applications.length} application{applications.length !== 1 ? "s" : ""}
              {hasActiveFilters ? " matching filters" : " pending review"}
            </p>
          </div>
          {nextApplication && (
            <Button variant="primary" asChild>
              <Link href={`/review/${nextApplication.id}`}>Review Next</Link>
            </Button>
          )}
        </div>

        {/* Filters toolbar wrapped in Suspense for useSearchParams */}
        <div className="mb-4">
          <Suspense fallback={<div className="h-8" />}>
            <QueueFiltersToolbar />
          </Suspense>
        </div>

        {/* Data table with empty state */}
        {applications.length > 0 ? (
          <QueueDataTable data={applications} />
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? "No applications match your filters."
                : "No applications in the queue."}
            </p>
            {hasActiveFilters && (
              <Link
                href="/queue"
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear all filters
              </Link>
            )}
          </div>
        )}
      </main>
    </>
  );
}
