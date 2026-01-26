"use client";

import * as React from "react";
import { QueueLoadingProvider, useQueueLoading } from "./queue-loading-context";
import { QueueFiltersToolbar } from "./queue-filters-toolbar";
import { QueueDataTable } from "./queue-data-table";
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
        <div className="flex flex-col items-center justify-center border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? "No applications match your filters."
              : "No applications in the queue."}
          </p>
          {hasActiveFilters && (
            <a
              href="/queue"
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear all filters
            </a>
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
