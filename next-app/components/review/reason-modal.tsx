"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  reasonCodes: { value: string; label: string }[];
  onSubmit: (reasonCode: string, notes?: string) => void;
  requireReason?: boolean;
  defaultReasonCode?: string;
  submitLabel?: string;
}

export function ReasonModal({
  open,
  onOpenChange,
  title,
  description,
  reasonCodes,
  onSubmit,
  requireReason = true,
  defaultReasonCode,
  submitLabel = "Submit",
}: ReasonModalProps) {
  const [reasonCode, setReasonCode] = React.useState<string>(
    defaultReasonCode ?? ""
  );
  const [notes, setNotes] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when modal opens/closes or default changes
  React.useEffect(() => {
    if (open) {
      setReasonCode(defaultReasonCode ?? "");
      setNotes("");
      setError(null);
    }
  }, [open, defaultReasonCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (requireReason && !reasonCode) {
      setError("Please select a reason code");
      return;
    }

    onSubmit(reasonCode, notes || undefined);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Reason Code Select */}
            <div className="space-y-2">
              <label
                htmlFor="reason-code"
                className="text-sm font-medium text-treasury-base-darkest"
              >
                Reason Code{requireReason && " *"}
              </label>
              <Select value={reasonCode} onValueChange={setReasonCode}>
                <SelectTrigger id="reason-code" className="w-full">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {reasonCodes.map((code) => (
                    <SelectItem key={code.value} value={code.value}>
                      {code.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && (
                <p className="text-sm text-treasury-warning">{error}</p>
              )}
            </div>

            {/* Notes Textarea */}
            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="text-sm font-medium text-treasury-base-darkest"
              >
                Notes (optional)
              </label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="primary-outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
