import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { QueuePageContent } from "./queue-page-content";
import { QueuePageSkeleton } from "./queue-page-skeleton";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; classType?: string; search?: string }>;
}) {
  return (
    <>
      <AppHeader />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-1">Application Queue</h1>

        <Suspense fallback={<QueuePageSkeleton />}>
          <QueuePageContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
