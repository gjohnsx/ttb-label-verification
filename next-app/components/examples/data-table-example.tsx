"use client"

/**
 * Data Table Example
 *
 * This file demonstrates how to use the reusable data table components.
 * Copy and adapt this pattern for your own data tables.
 *
 * Components used:
 * - DataTable: Main table component with sorting, filtering, pagination
 * - DataTableColumnHeader: Sortable/hideable column headers
 * - DataTableToolbar: Search, filters, and view options
 * - DataTableRowActions: Row action dropdown menus
 * - DataTableFacetedFilter: Multi-select filters with counts
 */

import { type ColumnDef } from "@tanstack/react-table"
import {
  CircleIcon,
  CircleCheckIcon,
  CircleXIcon,
  CircleDotIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

// =============================================================================
// 1. DEFINE YOUR DATA TYPE
// =============================================================================
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  priority: "low" | "medium" | "high"
}

// =============================================================================
// 2. DEFINE FILTER OPTIONS (for faceted filters)
// =============================================================================
export const statuses = [
  { value: "pending", label: "Pending", icon: CircleIcon },
  { value: "processing", label: "Processing", icon: CircleDotIcon },
  { value: "success", label: "Success", icon: CircleCheckIcon },
  { value: "failed", label: "Failed", icon: CircleXIcon },
]

export const priorities = [
  { value: "low", label: "Low", icon: ArrowDownIcon },
  { value: "medium", label: "Medium", icon: ArrowRightIcon },
  { value: "high", label: "High", icon: ArrowUpIcon },
]

// =============================================================================
// 3. DEFINE YOUR COLUMNS
// =============================================================================
export const columns: ColumnDef<Payment>[] = [
  // Selection checkbox column
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // ID column
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  // Email column with sorting
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[300px] truncate font-medium">
        {row.getValue("email")}
      </span>
    ),
  },
  // Status column with badge and filtering
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (s) => s.value === row.getValue("status")
      )
      if (!status) return null
      return (
        <div className="flex w-[100px] items-center gap-2">
          {status.icon && (
            <status.icon className="text-muted-foreground size-4" />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  // Priority column with filtering
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (p) => p.value === row.getValue("priority")
      )
      if (!priority) return null
      return (
        <div className="flex items-center gap-2">
          {priority.icon && (
            <priority.icon className="text-muted-foreground size-4" />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  // Amount column with formatting
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" className="justify-end" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  // Actions column
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        actions={[
          {
            label: "Copy ID",
            onClick: (row) => navigator.clipboard.writeText(row.original.id),
          },
          {
            label: "View details",
            onClick: (row) => console.log("View", row.original),
            separator: true,
          },
          {
            label: "Delete",
            onClick: (row) => console.log("Delete", row.original),
            variant: "destructive",
            separator: true,
          },
        ]}
      />
    ),
  },
]

// =============================================================================
// 4. SAMPLE DATA
// =============================================================================
const sampleData: Payment[] = [
  { id: "728ed52f", amount: 100, status: "pending", email: "m@example.com", priority: "high" },
  { id: "489e1d42", amount: 125, status: "processing", email: "example@gmail.com", priority: "medium" },
  { id: "a1b2c3d4", amount: 250, status: "success", email: "test@test.com", priority: "low" },
  { id: "e5f6g7h8", amount: 75, status: "failed", email: "user@domain.com", priority: "high" },
  { id: "i9j0k1l2", amount: 500, status: "success", email: "john@company.com", priority: "medium" },
  { id: "m3n4o5p6", amount: 320, status: "pending", email: "jane@business.org", priority: "low" },
  { id: "q7r8s9t0", amount: 890, status: "processing", email: "admin@site.net", priority: "high" },
  { id: "u1v2w3x4", amount: 150, status: "success", email: "contact@mail.com", priority: "medium" },
  { id: "y5z6a7b8", amount: 420, status: "failed", email: "support@help.io", priority: "low" },
  { id: "c9d0e1f2", amount: 200, status: "pending", email: "info@web.co", priority: "high" },
  { id: "g3h4i5j6", amount: 680, status: "success", email: "sales@shop.com", priority: "medium" },
  { id: "k7l8m9n0", amount: 95, status: "processing", email: "team@work.org", priority: "low" },
]

// =============================================================================
// 5. EXAMPLE COMPONENT
// =============================================================================
export function DataTableExample() {
  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={sampleData}
        pageSize={10}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumn="email"
            searchPlaceholder="Filter emails..."
            filters={[
              { column: "status", title: "Status", options: statuses },
              { column: "priority", title: "Priority", options: priorities },
            ]}
          />
        )}
      />
    </div>
  )
}

// =============================================================================
// USAGE NOTES
// =============================================================================
/**
 * Basic Usage:
 *
 * 1. Define your data type (TypeScript interface/type)
 * 2. Create column definitions using ColumnDef<YourType>[]
 * 3. Use DataTable component with columns and data props
 *
 * Features included:
 * - Row selection with checkboxes
 * - Sortable columns (click header to sort)
 * - Column visibility toggle (View dropdown)
 * - Faceted filtering (Status, Priority dropdowns)
 * - Text search filtering
 * - Pagination with configurable page sizes
 * - Row actions dropdown
 *
 * Customization:
 * - Pass custom `toolbar` render prop to DataTable for custom toolbar
 * - Use `showPagination={false}` to hide pagination
 * - Use `pageSize={25}` to set default page size
 * - Create custom filter functions using `filterFn` in column definition
 *
 * Import paths:
 * @example
 * import { DataTable } from "@/components/ui/data-table"
 * import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
 * import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
 * import { DataTableRowActions } from "@/components/ui/data-table-row-actions"
 * import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
 * import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
 * import { DataTablePagination } from "@/components/ui/data-table-pagination"
 */
