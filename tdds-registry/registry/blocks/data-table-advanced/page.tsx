"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { PlayIcon } from "lucide-react"

import { Badge } from "@/registry/ui/badge"
import { Checkbox } from "@/registry/ui/checkbox"
import { DataTable } from "@/registry/blocks/data-table-advanced/components/data-table"
import { DataTableColumnHeader } from "@/registry/blocks/data-table-advanced/components/data-table-column-header"
import { DataTableColumnCell } from "@/registry/blocks/data-table-advanced/components/data-table-column-cell"
import { DataTableToolbar } from "@/registry/blocks/data-table-advanced/components/data-table-toolbar"
import { DataTableSelectionToolbar } from "@/registry/blocks/data-table-advanced/components/data-table-selection-toolbar"
import {
  tasks,
  statuses,
  priorities,
  labels,
  type Task,
} from "@/registry/blocks/data-table-advanced/lib/demo-data"

const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "very_long_column_name_that_should_truncate_in_the_view_options_menu_to_prevent_layout_breakage",
    accessorFn: (row) => row.title,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Long Column" />
    ),
    cell: ({ row }) => (
      <DataTableColumnCell
        value={row.original.title}
        className="w-[150px]"
        label="Full Title"
      />
    ),
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label)

      return (
        <div className="flex gap-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue("priority")
      )

      if (!priority) {
        return null
      }

      return (
        <div className="flex items-center">
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return <div className="w-[100px]">{row.getValue("createdAt")}</div>
    },
  },
]

export default function DataTableDemo() {
  const handleProcessSelected = (selectedTasks: Task[]) => {
    console.log("Processing tasks:", selectedTasks)
    alert(`Processing ${selectedTasks.length} task(s)`)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">
          Manage your tasks with search, filters, sorting, and pagination.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={tasks}
        toolbar={(table) => (
          <div className="flex flex-col gap-4">
            <DataTableToolbar
              table={table}
              searchColumn="title"
              searchPlaceholder="Search tasks..."
              filters={[
                {
                  column: "status",
                  title: "Status",
                  options: statuses,
                },
                {
                  column: "priority",
                  title: "Priority",
                  options: priorities,
                },
              ]}
            />
            <DataTableSelectionToolbar
              table={table}
              onProcessSelected={handleProcessSelected}
              processLabel="Process Selected"
              processIcon={<PlayIcon className="mr-1.5 size-4" />}
            />
          </div>
        )}
      />
    </div>
  )
}
