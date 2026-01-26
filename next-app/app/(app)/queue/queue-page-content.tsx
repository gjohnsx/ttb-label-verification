import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getApplicationsForQueue,
  getNextApplicationToReview,
  getQueueFacetCounts,
  type QueueFilters,
} from "@/lib/queries/applications";
import { QueueContent } from "./queue-content";
import { loadQueueParams } from "./search-params";

type QueuePageContentProps = {
  searchParams: Promise<{ status?: string; classType?: string; search?: string }>;
};

export async function QueuePageContent({ searchParams }: QueuePageContentProps) {
  // Parse filters from URL search params (async in Next.js 16.1)
  const { status, classType, search } = await loadQueueParams(searchParams);
  const filters: QueueFilters = {
    status: status.length > 0 ? status : undefined,
    classType: classType.length > 0 ? classType : undefined,
    search: search ? search : undefined,
  };

  // Fetch applications with priority sorting and filters
  const [applications, nextApplication, facetCounts] = await Promise.all([
    getApplicationsForQueue(filters),
    getNextApplicationToReview(),
    getQueueFacetCounts(filters),
  ]);

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.status?.length ||
    filters.classType?.length ||
    filters.search
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {applications.length} application{applications.length !== 1 ? "s" : ""}
          {hasActiveFilters ? " matching filters" : " pending review"}
        </p>
        {nextApplication && (
          <Button variant="primary" asChild>
            <Link href={`/review/${nextApplication.id}`}>Review Next</Link>
          </Button>
        )}
      </div>

      {/* Filters and data table with shared loading context */}
      <QueueContent
        applications={applications}
        hasActiveFilters={hasActiveFilters}
        facetCounts={facetCounts}
      />
    </>
  );
}
