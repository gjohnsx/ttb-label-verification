"use client";

import * as React from "react";
import { CheckIcon, XIcon, CameraIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReasonModal } from "./reason-modal";
import { REJECTION_REASON_CODES } from "@/lib/constants";
import type { UIVerdict } from "@/lib/actions/reviews";

interface VerdictButtonsProps {
  applicationId: string;
  onApprove: () => void;
  onReject: (reasonCode: string, notes?: string) => void;
  onRequestImage: (reasonCode: string, notes?: string) => void;
  disabled?: boolean;
  reviewResult?: {
    verdict: UIVerdict;
    nextApplicationId: string | null;
  } | null;
}

export function VerdictButtons({
  applicationId,
  onApprove,
  onReject,
  onRequestImage,
  disabled = false,
  reviewResult = null,
}: VerdictButtonsProps) {
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [requestImageModalOpen, setRequestImageModalOpen] =
    React.useState(false);

  const handleApproveConfirm = () => {
    setApproveDialogOpen(false);
    onApprove();
  };

  const handleRejectSubmit = (reasonCode: string, notes?: string) => {
    onReject(reasonCode, notes);
  };

  const handleRequestImageSubmit = (reasonCode: string, notes?: string) => {
    onRequestImage(reasonCode, notes);
  };

  // Show "Review Next" button after successful review
  if (reviewResult) {
    const verdictLabel =
      reviewResult.verdict === "APPROVED"
        ? "approved"
        : reviewResult.verdict === "REJECTED"
          ? "rejected"
          : "returned for better image";

    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Application {verdictLabel}
        </span>
        {reviewResult.nextApplicationId ? (
          <Button variant="primary" asChild>
            <Link href={`/review/${reviewResult.nextApplicationId}`}>
              Review Next
              <ArrowRightIcon className="ml-1.5" />
            </Link>
          </Button>
        ) : (
          <Button variant="primary" asChild>
            <Link href="/queue">
              Back to Queue
              <ArrowRightIcon className="ml-1.5" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Reject - warning/red style */}
        <Button
          variant="warning"
          onClick={() => setRejectModalOpen(true)}
          disabled={disabled}
        >
          <XIcon className="mr-1.5" />
          Reject
        </Button>

        {/* Approve - secondary/green style */}
        <Button
          variant="secondary"
          onClick={() => setApproveDialogOpen(true)}
          disabled={disabled}
        >
          <CheckIcon className="mr-1.5" />
          Approve
        </Button>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this application? This action
              will mark the label as compliant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="base">Cancel</AlertDialogCancel>
            <AlertDialogAction variant="secondary" onClick={handleApproveConfirm}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Modal */}
      <ReasonModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        title="Reject Application"
        description="Please provide a reason for rejecting this application."
        reasonCodes={[...REJECTION_REASON_CODES]}
        onSubmit={handleRejectSubmit}
        requireReason={true}
        submitLabel="Reject Application"
        submitVariant="warning"
      />

      {/* Request Better Image Modal */}
      <ReasonModal
        open={requestImageModalOpen}
        onOpenChange={setRequestImageModalOpen}
        title="Request Better Image"
        description="Request a higher quality image from the applicant."
        reasonCodes={[...REJECTION_REASON_CODES]}
        onSubmit={handleRequestImageSubmit}
        requireReason={false}
        defaultReasonCode="IMAGE_QUALITY"
        submitLabel="Request Image"
      />
    </>
  );
}
