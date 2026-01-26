"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pause, Play, X } from "lucide-react";
import { BatchItemRow, type BatchItem, type BatchItemStatus } from "./batch-item-row";
import { BatchProgressBar } from "./batch-progress-bar";

interface ApplicationInfo {
  id: string;
  brandName: string;
}

interface BatchProgressModalProps {
  applications: ApplicationInfo[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Simulate processing outcomes (70% Ready, 25% Needs Attention, 5% Error)
function getRandomOutcome(): BatchItemStatus {
  const rand = Math.random();
  if (rand < 0.70) return "READY";
  if (rand < 0.95) return "NEEDS_ATTENTION";
  return "ERROR";
}

export function BatchProgressModal({
  applications,
  open,
  onOpenChange,
}: BatchProgressModalProps) {
  // Initialize items state from applications
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const processingRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize items when applications change or modal opens
  useEffect(() => {
    if (open && applications.length > 0) {
      const initialItems: BatchItem[] = applications.map((app) => ({
        id: app.id,
        brandName: app.brandName,
        status: "QUEUED" as BatchItemStatus,
      }));
      setItems(initialItems);
      setIsPaused(false);
      setIsComplete(false);
    }
  }, [open, applications]);

  // Process next item in queue
  const processNextItem = useCallback(() => {
    setItems((currentItems) => {
      // Find first QUEUED item
      const queuedIndex = currentItems.findIndex((item) => item.status === "QUEUED");

      if (queuedIndex === -1) {
        // No more queued items - check if we have a processing item
        const processingIndex = currentItems.findIndex((item) => item.status === "PROCESSING");

        if (processingIndex !== -1) {
          // Complete the processing item
          const newItems = [...currentItems];
          newItems[processingIndex] = {
            ...newItems[processingIndex],
            status: getRandomOutcome(),
          };
          return newItems;
        }

        return currentItems;
      }

      // Check if we have a currently processing item
      const processingIndex = currentItems.findIndex((item) => item.status === "PROCESSING");

      if (processingIndex !== -1) {
        // Complete the current processing item and start the next
        const newItems = [...currentItems];
        newItems[processingIndex] = {
          ...newItems[processingIndex],
          status: getRandomOutcome(),
        };
        newItems[queuedIndex] = {
          ...newItems[queuedIndex],
          status: "PROCESSING",
        };
        return newItems;
      } else {
        // No processing item, start the first queued item
        const newItems = [...currentItems];
        newItems[queuedIndex] = {
          ...newItems[queuedIndex],
          status: "PROCESSING",
        };
        return newItems;
      }
    });
  }, []);

  // Check if all items are complete
  useEffect(() => {
    if (items.length === 0) return;

    const allComplete = items.every(
      (item) =>
        item.status === "READY" ||
        item.status === "NEEDS_ATTENTION" ||
        item.status === "ERROR"
    );

    if (allComplete && !isComplete) {
      setIsComplete(true);

      // Count outcomes for toast
      const readyCount = items.filter((item) => item.status === "READY").length;
      const attentionCount = items.filter((item) => item.status === "NEEDS_ATTENTION").length;
      const errorCount = items.filter((item) => item.status === "ERROR").length;

      toast.success("Batch processing complete!", {
        description: `${readyCount} ready, ${attentionCount} need attention${errorCount > 0 ? `, ${errorCount} errors` : ""}`,
      });
    }
  }, [items, isComplete]);

  // Run processing simulation
  useEffect(() => {
    if (!open || isPaused || isComplete || items.length === 0) {
      if (processingRef.current) {
        clearTimeout(processingRef.current);
        processingRef.current = null;
      }
      return;
    }

    // Check if there's still work to do
    const hasWork = items.some(
      (item) => item.status === "QUEUED" || item.status === "PROCESSING"
    );

    if (!hasWork) return;

    // Random interval between 1-2 seconds
    const interval = 1000 + Math.random() * 1000;

    processingRef.current = setTimeout(() => {
      processNextItem();
    }, interval);

    return () => {
      if (processingRef.current) {
        clearTimeout(processingRef.current);
        processingRef.current = null;
      }
    };
  }, [open, isPaused, isComplete, items, processNextItem]);

  // Calculate progress
  const completedCount = items.filter(
    (item) =>
      item.status === "READY" ||
      item.status === "NEEDS_ATTENTION" ||
      item.status === "ERROR"
  ).length;

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleCancel = () => {
    if (processingRef.current) {
      clearTimeout(processingRef.current);
      processingRef.current = null;
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col"
        showCloseButton={false}
      >
        <SheetHeader className="border-b border-treasury-base-lighter pb-4">
          <SheetTitle className="text-treasury-ink">
            {isComplete ? "Batch Complete" : "Processing Batch"}
          </SheetTitle>
          <SheetDescription className="text-treasury-base-dark">
            {isComplete
              ? "All applications have been processed"
              : isPaused
                ? "Processing paused"
                : "Processing applications..."}
          </SheetDescription>
        </SheetHeader>

        {/* Progress bar section */}
        <div className="px-4 py-4 border-b border-treasury-base-lighter">
          <BatchProgressBar completed={completedCount} total={items.length} />
        </div>

        {/* Scrollable items list */}
        <div className="flex-1 overflow-y-auto px-1">
          {items.map((item) => (
            <BatchItemRow key={item.id} item={item} />
          ))}
        </div>

        {/* Footer with controls */}
        <SheetFooter className="border-t border-treasury-base-lighter pt-4 flex-row justify-end gap-2">
          {isComplete ? (
            <Button variant="primary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="primary-outline"
                onClick={handlePauseToggle}
                className="gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                variant="warning"
                onClick={handleCancel}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
