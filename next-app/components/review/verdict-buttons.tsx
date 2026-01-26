"use client";

import * as React from "react";
import { CheckIcon, XIcon, CameraIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReasonModal } from "./reason-modal";
import { REJECTION_REASON_CODES } from "@/lib/constants";

interface VerdictButtonsProps {
  applicationId: string;
  onApprove: () => void;
  onReject: (reasonCode: string, notes?: string) => void;
  onRequestImage: (reasonCode: string, notes?: string) => void;
  disabled?: boolean;
}

export function VerdictButtons({
  applicationId,
  onApprove,
  onReject,
  onRequestImage,
  disabled = false,
}: VerdictButtonsProps) {
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [requestImageModalOpen, setRequestImageModalOpen] =
    React.useState(false);

  const handleApprove = () => {
    onApprove();
  };

  const handleRejectSubmit = (reasonCode: string, notes?: string) => {
    onReject(reasonCode, notes);
  };

  const handleRequestImageSubmit = (reasonCode: string, notes?: string) => {
    onRequestImage(reasonCode, notes);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Request Better Image - outline style */}
        <Button
          variant="primary-outline"
          onClick={() => setRequestImageModalOpen(true)}
          disabled={disabled}
        >
          <CameraIcon className="mr-1.5" />
          Request Better Image
        </Button>

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
        <Button variant="secondary" onClick={handleApprove} disabled={disabled}>
          <CheckIcon className="mr-1.5" />
          Approve
        </Button>
      </div>

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
