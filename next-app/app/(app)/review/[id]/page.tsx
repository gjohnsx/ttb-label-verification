import { Suspense } from "react";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { ApplicationMenu } from "@/components/review/application-menu";
import { ReviewActionBar } from "@/components/review/review-action-bar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ReviewContentAsync } from "./review-content-async";
import { ReviewContentSkeleton } from "./review-content-skeleton";

type ReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;

  return (
    <>
      <AppHeader />

      {/* Breadcrumb Navigation - Full width */}
      <Breadcrumb>
        <div className="container mx-auto px-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/queue"
                  className="hover:underline"
                >
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
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-treasury-base-darkest">
              Label Review
            </h1>
            <p className="text-treasury-base-dark">
              Compare application data against extracted label values
            </p>
          </div>
          <ApplicationMenu applicationId={id} />
        </div>

        {/* Content + actions with Suspense boundary */}
        <Suspense
          fallback={
            <>
              <ReviewContentSkeleton />
              <ReviewActionBar applicationId={id} disabled />
            </>
          }
        >
          <ReviewContentAsync id={id} />
          <ReviewActionBar applicationId={id} />
        </Suspense>

        {/* Bottom padding to account for sticky action bar */}
        <div className="h-24" />
      </main>
    </>
  );
}
