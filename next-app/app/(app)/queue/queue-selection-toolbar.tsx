"use client";

import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { X, Play } from "lucide-react";
import { type ApplicationForQueue } from "@/lib/queries/applications";
import { BatchProgressModal } from "@/components/batch";

interface QueueSelectionToolbarProps {
  table: Table<ApplicationForQueue>;
}

export function QueueSelectionToolbar({ table }: QueueSelectionToolbarProps) {
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<
    { id: string; brandName: string }[]
  >([]);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) {
    return null;
  }

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

  return (
    <>
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
            variant="primary"
            onClick={handleProcessSelected}
          >
            <Play className="mr-1.5 size-4" />
            Process Selected
          </Button>
        </div>
      </div>

      <BatchProgressModal
        applications={selectedApplications}
        open={batchModalOpen}
        onOpenChange={setBatchModalOpen}
      />
    </>
  );
}
