"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { type ApplicationForQueue, type ApplicationStatus } from "@/lib/queries/applications";

// Status badge variant mapping
const statusVariants: Record<ApplicationStatus, "treasury-base" | "treasury-primary" | "treasury-secondary" | "treasury-accent" | "treasury-warning"> = {
  PENDING: "treasury-base",
  PROCESSING: "treasury-primary",
  READY: "treasury-secondary",
  NEEDS_ATTENTION: "treasury-accent",
  REVIEWED: "treasury-primary",
  ERROR: "treasury-warning",
};

// Human-readable status labels
const statusLabels: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  READY: "Ready",
  NEEDS_ATTENTION: "Needs Attention",
  REVIEWED: "Reviewed",
  ERROR: "Error",
};

function StatusBadge({ status }: { status: string }) {
  const variant = statusVariants[status as ApplicationStatus] ?? "treasury-base";
  const label = statusLabels[status as ApplicationStatus] ?? status;

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
}

export const columns: ColumnDef<ApplicationForQueue>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "colaId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="COLA ID" />
    ),
    cell: ({ row }) => {
      const colaId = row.getValue("colaId") as string | null;
      return <span className="font-mono">{colaId ?? "N/A"}</span>;
    },
  },
  {
    accessorKey: "brandName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand Name" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row.getValue("brandName")}</span>
      );
    },
  },
  {
    accessorKey: "classType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Class Type" />
    ),
    cell: ({ row }) => {
      const classType = row.getValue("classType") as string | null;
      return <span>{classType ?? "N/A"}</span>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return <StatusBadge status={row.getValue("status")} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <span className="text-muted-foreground">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const application = row.original;

      return (
        <Button variant="primary-light" size="sm" className="w-full" asChild>
          <Link href={`/review/${application.id}`}>Review</Link>
        </Button>
      );
    },
  },
];
