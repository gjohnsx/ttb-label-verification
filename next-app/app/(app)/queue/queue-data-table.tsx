"use client";

import { DataTable } from "@/components/data-table/data-table";
import { type ApplicationForQueue } from "@/lib/queries/applications";
import { columns } from "./columns";
import { QueueSelectionToolbar } from "./queue-selection-toolbar";

interface QueueDataTableProps {
  data: ApplicationForQueue[];
}

export function QueueDataTable({ data }: QueueDataTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      showPagination={true}
      pageSize={20}
      toolbar={(table) => <QueueSelectionToolbar table={table} />}
    />
  );
}
