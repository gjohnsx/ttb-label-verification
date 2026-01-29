"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { X, Play, Trash2 } from "lucide-react";
import { type ApplicationForQueue } from "@/lib/queries/applications";
import { BatchProgressModal } from "@/components/batch";
import { deleteApplications } from "@/lib/actions/admin";
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

interface QueueSelectionToolbarProps {
  table: Table<ApplicationForQueue>;
}

export function QueueSelectionToolbar({ table }: QueueSelectionToolbarProps) {
  const router = useRouter();
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedApplications, setSelectedApplications] = useState<
    { id: string; brandName: string }[]
  >([]);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleProcessSelected = () => {
    const applications = selectedRows.map((row) => ({
      id: row.original.id,
      brandName: row.original.brandName,
    }));

    setSelectedApplications(applications);
    setBatchModalOpen(true);

    // Clear selection
    table.resetRowSelection();
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleDeleteSelected = async () => {
    const ids = selectedRows.map((row) => row.original.id);
    startTransition(async () => {
      const result = await deleteApplications(ids);
      if (result.success) {
        table.resetRowSelection();
        router.refresh();
      }
    });
    setDeleteDialogOpen(false);
  };

  return (
    <>
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-md border border-treasury-primary-light bg-treasury-primary-lightest px-4 py-3">
          <span className="text-sm font-medium text-treasury-ink">
            {selectedCount} application{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="base"
              onClick={handleClearSelection}
            >
              <X className="mr-1.5 size-4" />
              Clear Selection
            </Button>
            <Button
              variant="warning"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isPending}
            >
              <Trash2 className="mr-1.5 size-4" />
              {isPending ? "Deleting..." : "Delete Selected"}
            </Button>
            <Button
              variant="primary"
              onClick={handleProcessSelected}
            >
              <Play className="mr-1.5 size-4" />
              Process Selected
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} application{selectedCount !== 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected applications and all related data (images, OCR results, comparisons, reviews). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="base">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} variant="warning">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BatchProgressModal
        applications={selectedApplications}
        open={batchModalOpen}
        onOpenChange={setBatchModalOpen}
      />
    </>
  );
}
