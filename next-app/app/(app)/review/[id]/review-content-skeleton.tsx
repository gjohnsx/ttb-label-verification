import { Skeleton } from "@/components/ui/skeleton";

export function ReviewContentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[40%_1fr]">
      {/* Left Panel: Image Gallery skeleton */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        {/* Removed header skeleton as requested */}
        
        {/* Stacked image thumbnails - matches new ImageGallery layout */}
        <div className="flex flex-col gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="group relative w-full overflow-hidden border border-gray-200 bg-white shadow-sm">
              {/* Image Area - Top */}
              <div className="relative aspect-4/3 w-full bg-gray-100 flex items-center justify-center">
                <Skeleton className="h-full w-full opacity-50" />
              </div>

              {/* Content Area - Bottom */}
              <div className="border-t border-gray-100 bg-white px-4 py-3 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Image count skeleton */}
        <div className="mt-4 flex justify-center">
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Right Panel: Summary + Comparison Table skeleton */}
      <div className="space-y-6">
        {/* OCR Status skeleton */}
        <div className="flex items-center justify-between gap-3 border border-treasury-base bg-treasury-base-lightest px-3 py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-6">
          {/* Tab list */}
          <div className="relative flex w-full items-end gap-0 border-b border-treasury-primary">
            <div className="flex-1 border-t-4 border-treasury-primary border-l border-treasury-base-light bg-background px-6 py-3 first:border-l-0">
              <Skeleton className="h-4 w-24 rounded-none" />
            </div>
            <div className="flex-1 border-t-4 border-treasury-base-light border-l border-treasury-base-light bg-transparent px-6 py-3">
              <Skeleton className="h-4 w-20 rounded-none" />
            </div>
            <div className="flex-1 border-t-4 border-treasury-base-light border-l border-treasury-base-light bg-transparent px-6 py-3">
              <Skeleton className="h-4 w-24 rounded-none" />
            </div>
          </div>

          {/* Review Card skeleton (Merged Summary + Table) */}
          <div className="border bg-card shadow-sm">
            {/* Header (Summary) */}
            <div className="border-b bg-gray-50 p-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Icon circle */}
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  {/* App ID */}
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
            </div>

            {/* Body (Table) */}
            <div className="overflow-hidden">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b">
                    <th className="w-[180px] px-4 py-3 text-left"><Skeleton className="h-4 w-12" /></th>
                    <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-28" /></th>
                    <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                    <th className="w-[200px] px-4 py-3 text-left"><Skeleton className="h-4 w-14" /></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-10" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-20" /></td>
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
