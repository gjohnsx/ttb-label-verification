import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ReviewContentSkeleton } from "./review-content-skeleton";

export default function Loading() {
  return (
    <>
      <AppHeader />

      {/* Breadcrumb Navigation - Full width */}
      <Breadcrumb>
        <div className="container mx-auto px-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/queue" className="hover:underline">
                  Queue
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Review</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </div>
      </Breadcrumb>

      <main className="container mx-auto py-6 px-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-treasury-base-darkest">
            Label Review
          </h1>
          <p className="text-treasury-base-dark">
            Compare application data against extracted label values
          </p>
        </div>

        <ReviewContentSkeleton />

        {/* Bottom padding to account for sticky action bar */}
        <div className="h-24" />
      </main>
    </>
  );
}
