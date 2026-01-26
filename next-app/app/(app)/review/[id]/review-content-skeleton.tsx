import { Skeleton } from "@/components/ui/skeleton";

export function ReviewContentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[40%_1fr]">
      {/* Left Panel: Image Gallery skeleton */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <Skeleton className="h-6 w-28 mb-3" />
        {/* Stacked image thumbnails - matches ImageGallery layout */}
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-treasury-base-darkest">
              {/* Type badge area */}
              <div className="relative">
                <div className="absolute left-2 top-2 z-10">
                  <Skeleton className="h-5 w-14" />
                </div>
              </div>
              {/* Image area */}
              <div className="aspect-[4/3] flex items-center justify-center p-2">
                <Skeleton className="h-full w-full" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-40 mx-auto mt-3" />
      </div>

      {/* Right Panel: Summary + Comparison Table skeleton */}
      <div className="space-y-6">
        {/* OCR Status skeleton - matches OcrStatus border style (no rounded) */}
        <div className="flex items-center justify-between gap-3 border border-treasury-base bg-treasury-base-lightest px-3 py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-6">
          {/* Tab list - matches USWDS tabs */}
          <div className="flex border-b border-treasury-base-light">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24 ml-1" />
          </div>

          {/* Review Summary skeleton - matches ReviewSummary (border-2, no rounded) */}
          <div className="border-2 border-treasury-base p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  {/* Status badge */}
                  <Skeleton className="h-8 w-28" />
                  {/* Match count */}
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              {/* Application ID */}
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Field Comparison heading */}
          <div>
            <Skeleton className="h-6 w-36 mb-3" />
            {/* Comparison Table skeleton - matches ComparisonTable structure */}
            <div className="bg-card overflow-hidden">
              {/* Table */}
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b">
                    <th className="w-[180px] px-4 py-3 text-left">
                      <Skeleton className="h-4 w-12" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Skeleton className="h-4 w-28" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="w-[200px] px-4 py-3 text-left">
                      <Skeleton className="h-4 w-14" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
