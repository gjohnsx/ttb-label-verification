"use client"

import { type Table } from "@tanstack/react-table"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select"
import { Separator } from "@/registry/ui/separator"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 25, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const maxVisiblePages = 9

    if (pageCount <= maxVisiblePages) {
      // Show all pages if there are few enough
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i)
      }
    } else {
      // Always show first few pages, then ellipsis, then last page
      for (let i = 1; i <= Math.min(maxVisiblePages - 1, pageCount - 1); i++) {
        pages.push(i)
      }
      if (pageCount > maxVisiblePages) {
        pages.push("ellipsis")
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="w-full">
      <Separator className="mb-4" />
      <div className="flex items-center justify-between">
        {/* Previous button */}
        <button
          className={cn(
            "inline-flex items-center justify-center h-9 w-9 transition-colors",
            table.getCanPreviousPage()
              ? "text-treasury-base-dark hover:text-treasury-primary"
              : "text-treasury-base-light cursor-not-allowed"
          )}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to previous page"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-2">
          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="h-9 min-w-9 px-2 inline-flex items-center justify-center text-sm text-treasury-base-dark"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => table.setPageIndex(page - 1)}
                className={cn(
                  "inline-flex items-center justify-center h-9 min-w-9 px-2 text-sm font-medium transition-colors",
                  currentPage === page
                    ? "text-treasury-primary font-bold"
                    : "text-treasury-base-dark hover:text-treasury-primary"
                )}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next button */}
        <button
          className={cn(
            "inline-flex items-center justify-center h-9 w-9 transition-colors",
            table.getCanNextPage()
              ? "text-treasury-base-dark hover:text-treasury-primary"
              : "text-treasury-base-light cursor-not-allowed"
          )}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Go to next page"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Row info and page size selector */}
      <div className="flex items-center justify-between mt-4 text-sm text-treasury-base-dark">
        <div>
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
