"use client"

import * as React from "react"
import { type Table } from "@tanstack/react-table"
import { XIcon, SearchIcon } from "lucide-react"

import { Button } from "@/registry/ui/button"
import { Input } from "@/registry/ui/input"
import { DataTableViewOptions } from "@/registry/blocks/data-table-advanced/components/data-table-view-options"
import { DataTableFacetedFilter } from "@/registry/blocks/data-table-advanced/components/data-table-faceted-filter"
import { useDebounce } from "@/registry/blocks/data-table-advanced/hooks/use-debounce"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchColumn?: string
  searchPlaceholder?: string
  filters?: {
    column: string
    title: string
    options: {
      label: string
      value: string
    }[]
  }[]
  actions?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = "Search...",
  filters = [],
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // Local state for search input (for debouncing)
  const currentValue = searchColumn
    ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
    : ""
  const [searchInput, setSearchInput] = React.useState(currentValue)
  const debouncedSearch = useDebounce(searchInput, 300)

  // Sync local state when external filter changes
  React.useEffect(() => {
    setSearchInput(currentValue)
  }, [currentValue])

  // Update table filter when debounced search changes
  React.useEffect(() => {
    if (searchColumn && debouncedSearch !== currentValue) {
      table.getColumn(searchColumn)?.setFilterValue(debouncedSearch || undefined)
    }
  }, [debouncedSearch, searchColumn, table, currentValue])

  const handleClearFilters = () => {
    setSearchInput("")
    table.resetColumnFilters()
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {searchColumn && (
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-[200px] pl-8 lg:w-[300px]"
            />
          </div>
        )}
        {filters.map((filter) => {
          const column = table.getColumn(filter.column)
          if (!column) return null
          return (
            <DataTableFacetedFilter
              key={filter.column}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          )
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8"
          >
            Clear filters
            <XIcon className="ml-1 size-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        {actions}
      </div>
    </div>
  )
}
