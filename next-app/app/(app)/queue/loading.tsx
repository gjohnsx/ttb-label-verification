import { AppHeader } from "@/components/layout/app-header";
import { QueuePageSkeleton } from "./queue-page-skeleton";

export default function Loading() {
  return (
    <>
      <AppHeader />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-1">Application Queue</h1>
        <QueuePageSkeleton />
      </main>
    </>
  );
}
