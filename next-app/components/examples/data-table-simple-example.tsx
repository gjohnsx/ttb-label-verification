"use client"

/**
 * Simple Data Table Example
 *
 * Minimal example showing basic data table usage without
 * all the advanced features. Good starting point for simple tables.
 */

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

// 1. Define your data type
type User = {
  id: string
  name: string
  email: string
  role: string
}

// 2. Define columns
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    header: "Role", // Simple string header (no sorting)
  },
]

// 3. Sample data
const users: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
]

// 4. Render the table
export function SimpleDataTableExample() {
  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={users}
        showPagination={false} // Hide pagination for small tables
      />
    </div>
  )
}
