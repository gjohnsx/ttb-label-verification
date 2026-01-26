import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { getAgent } from "@/lib/dal";
import {
  getApplicationsForQueue,
  getNextApplicationToReview,
  getQueueFacetCounts,
  type QueueFilters,
} from "@/lib/queries/applications";
import { QueueContent } from "./queue-content";
import { loadQueueParams } from "./search-params";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; classType?: string; search?: string }>;
}) {
  // This will redirect to / if not authenticated
  const agent = await getAgent();

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

        {/* Filters and data table with shared loading context */}
        <QueueContent
          applications={applications}
          hasActiveFilters={hasActiveFilters}
          facetCounts={facetCounts}
        />
      </main>
    </>
  );
}
