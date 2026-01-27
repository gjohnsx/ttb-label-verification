"use client"

import { type Table } from "@tanstack/react-table"
import { XIcon } from "lucide-react"

import { Button } from "@/registry/ui/button"

interface DataTableSelectionToolbarProps<TData> {
  table: Table<TData>
  onProcessSelected?: (rows: TData[]) => void
  processLabel?: string
  processIcon?: React.ReactNode
}

export function DataTableSelectionToolbar<TData>({
  table,
  onProcessSelected,
  processLabel = "Process Selected",
  processIcon,
}: DataTableSelectionToolbarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleProcessSelected = () => {
    if (onProcessSelected) {
      onProcessSelected(selectedRows.map((row) => row.original))
    }
    table.resetRowSelection()
  }

  const handleClearSelection = () => {
    table.resetRowSelection()
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-treasury-primary-light bg-treasury-primary-lightest px-4 py-3">
      <span className="text-sm font-medium text-treasury-ink">
        {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2">
        <Button variant="base" onClick={handleClearSelection}>
          <XIcon className="mr-1.5 size-4" />
          Clear Selection
        </Button>
        {onProcessSelected && (
          <Button variant="primary" onClick={handleProcessSelected}>
            {processIcon}
            {processLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
