"use client";

import * as React from "react";
import { toast } from "sonner";

import { VerdictButtons } from "./verdict-buttons";
import {
  submitReview,
  getNextUnreviewedApplicationId,
  type UIVerdict,
} from "@/lib/actions/reviews";

interface ReviewActionBarProps {
  applicationId: string;
  disabled?: boolean;
}

interface ReviewResult {
  verdict: UIVerdict;
  nextApplicationId: string | null;
}

export function ReviewActionBar({ applicationId, disabled = false }: ReviewActionBarProps) {
  const [isPending, startTransition] = React.useTransition();
  const [reviewResult, setReviewResult] = React.useState<ReviewResult | null>(
    null
  );

  const handleSubmitReview = async (
    verdict: UIVerdict,
    reasonCode?: string,
    notes?: string
  ) => {
    startTransition(async () => {
      const loadingMessage =
        verdict === "APPROVED"
          ? "Approving application..."
          : verdict === "REJECTED"
            ? "Rejecting application..."
            : "Requesting better image...";

      const toastId = toast(loadingMessage, {
        duration: Infinity,
      });

      try {
        const result = await submitReview(
          applicationId,
          verdict,
          reasonCode,
          notes
        );

        if (result.success) {
          // Get next application ID for "Review Next" button
          const nextId = await getNextUnreviewedApplicationId(applicationId);

          toast.success(
            verdict === "APPROVED"
              ? "Application approved"
              : verdict === "REJECTED"
                ? "Application rejected"
                : "Better image requested",
            { id: toastId, duration: 3000 }
          );

          // Stay on page and show "Review Next" button
          setReviewResult({
            verdict,
            nextApplicationId: nextId,
          });
        } else {
          toast.error(result.error || "Failed to submit review", {
            id: toastId,
          });
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
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
          disabled={disabled || isPending}
          reviewResult={reviewResult}
        />
      </div>
    </div>
  );
}
