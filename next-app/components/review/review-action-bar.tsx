"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { VerdictButtons } from "./verdict-buttons";
import {
  submitReview,
  type UIVerdict,
} from "@/lib/actions/reviews";

interface ReviewActionBarProps {
  applicationId: string;
}

export function ReviewActionBar({ applicationId }: ReviewActionBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleSubmitReview = async (
    verdict: UIVerdict,
    reasonCode?: string,
    notes?: string
  ) => {
    startTransition(async () => {
      const toastId = toast.loading(
        verdict === "APPROVED"
          ? "Approving application..."
          : verdict === "REJECTED"
            ? "Rejecting application..."
            : "Requesting better image..."
      );

      try {
        const result = await submitReview(
          applicationId,
          verdict,
          reasonCode,
          notes
        );

        if (result.success) {
          toast.success(
            verdict === "APPROVED"
              ? "Application approved successfully"
              : verdict === "REJECTED"
                ? "Application rejected"
                : "Better image requested",
            { id: toastId }
          );

          // Navigate to queue after successful submission
          router.push("/queue");
        } else {
          toast.error(result.error || "Failed to submit review", {
            id: toastId,
          });
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        toast.error(
          error instanceof Error ? error.message : "An unexpected error occurred",
          { id: toastId }
        );
      }
    });
  };

  const handleApprove = () => {
    handleSubmitReview("APPROVED");
  };

  const handleReject = (reasonCode: string, notes?: string) => {
    handleSubmitReview("REJECTED", reasonCode, notes);
  };

  const handleRequestImage = (reasonCode: string, notes?: string) => {
    handleSubmitReview("REQUEST_IMAGE", reasonCode, notes);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-treasury-base-light bg-white shadow-lg">
      <div className="container mx-auto flex items-center justify-end px-4 py-4">
        <VerdictButtons
          applicationId={applicationId}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestImage={handleRequestImage}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
