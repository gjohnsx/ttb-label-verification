import { Skeleton } from "@/components/ui/skeleton";

export function QueuePageSkeleton() {
  return (
    <>
      {/* Page header skeleton: count text + Review Next button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filters skeleton - matches QueueFiltersToolbar layout */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-1 items-center gap-2">
          {/* Search input skeleton */}
          <Skeleton className="h-10 w-[200px] lg:w-[300px]" />
          {/* Status filter button */}
          <Skeleton className="h-10 w-24" />
          {/* Class Type filter button */}
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Table skeleton - matches QueueDataTable structure */}
      <div className="border overflow-hidden bg-card">
        {/* Table header */}
        <div className="bg-muted/50 border-b px-4 py-3 flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b last:border-b-0 px-4 py-4 flex items-center gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </>
  );
}
