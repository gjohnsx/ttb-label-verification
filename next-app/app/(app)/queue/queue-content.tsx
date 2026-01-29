"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { QueueLoadingProvider, useQueueLoading } from "./queue-loading-context";
import { QueueFiltersToolbar } from "./queue-filters-toolbar";
import { QueueDataTable } from "./queue-data-table";
import { Button } from "@/components/ui/button";
import { type ApplicationForQueue } from "@/lib/queries/applications";

interface QueueContentProps {
  applications: ApplicationForQueue[];
  hasActiveFilters: boolean;
  facetCounts: {
    statusCounts: Record<string, number>;
    classTypeCounts: Record<string, number>;
  };
}

function QueueContentInner({ applications, hasActiveFilters, facetCounts }: QueueContentProps) {
  const { isLoading } = useQueueLoading();

  return (
    <>
      {/* Filters toolbar */}
      <div className="mb-4">
        <QueueFiltersToolbar facetCounts={facetCounts} />
      </div>

      {/* Data table with loading state */}
      {applications.length > 0 ? (
        <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity" : ""}>
          <QueueDataTable data={applications} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          {hasActiveFilters ? (
            <>
              <p className="text-muted-foreground">
                No applications match your filters.
              </p>
              <a
                href="/queue"
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear all filters
              </a>
            </>
          ) : (
            <>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-treasury-base-light">
                <Upload className="size-6 text-treasury-base-darkest" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No applications yet</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Get started by uploading your first label application.
              </p>
              <Button asChild className="mt-6">
                <Link href="/upload">
                  <Upload className="mr-2 size-4" />
                  Upload Application
                </Link>
              </Button>
              <p className="mt-6 max-w-sm text-xs text-muted-foreground/70">
                This prototype operates standalone. With COLA integration,
                applications would flow in automatically for real-time review.
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}

export function QueueContent(props: QueueContentProps) {
  return (
    <QueueLoadingProvider>
      <QueueContentInner {...props} />
    </QueueLoadingProvider>
  );
}
