"use client";

import { useQueryStates } from "nuqs";
import { type SortingState } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { type ApplicationForQueue } from "@/lib/queries/applications";
import { columns } from "./columns";
import { QueueSelectionToolbar } from "./queue-selection-toolbar";
import { queueParsers } from "./search-params.shared";

interface QueueDataTableProps {
  data: ApplicationForQueue[];
}

export function QueueDataTable({ data }: QueueDataTableProps) {
  const [{ sortBy, sortOrder }, setSort] = useQueryStates(queueParsers, {
    shallow: false,
  });

  const sorting: SortingState = sortBy
    ? [{ id: sortBy, desc: sortOrder === "desc" }]
    : [];

  function handleSortingChange(next: SortingState) {
    if (next.length === 0) {
      setSort({ sortBy: null, sortOrder: null });
    } else {
      setSort({
        sortBy: next[0].id,
        sortOrder: next[0].desc ? "desc" : "asc",
      });
    }
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      showPagination={true}
      pageSize={20}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      toolbar={(table) => <QueueSelectionToolbar table={table} />}
    />
  );
}
