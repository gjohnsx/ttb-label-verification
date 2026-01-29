"use client";

import * as React from "react";
import { XIcon, SearchIcon } from "lucide-react";
import { useQueryStates } from "nuqs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueueFacetedFilter } from "./queue-faceted-filter";
import { APPLICATION_STATUSES, CLASS_TYPES } from "@/lib/constants";
import { queueParsers } from "./search-params.shared";
import { useQueueLoading } from "./queue-loading-context";

interface QueueFiltersToolbarProps {
  facetCounts: {
    statusCounts: Record<string, number>;
    classTypeCounts: Record<string, number>;
  };
}

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function QueueFiltersToolbar({ facetCounts }: QueueFiltersToolbarProps) {
  const { startTransition } = useQueueLoading();
  const [{ status, classType, search, ids }, setFilters] = useQueryStates(queueParsers, {
    startTransition,
  });

  const { statusCounts, classTypeCounts } = facetCounts;

  // Local state for search input (for debouncing)
  const [searchInput, setSearchInput] = React.useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);

  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update URL when debounced search changes
  React.useEffect(() => {
    if (debouncedSearch === search) {
      return;
    }

    setFilters({ search: debouncedSearch ? debouncedSearch : null });
  }, [debouncedSearch, search, setFilters]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput("");
    setFilters({ status: null, classType: null, search: null, ids: null });
  };

  // Check if any filters are active
  const hasActiveFilters = status.length > 0 || classType.length > 0 || search.length > 0 || ids.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {/* Search input */}
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by brand or COLA ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 w-[200px] pl-8 lg:w-[300px]"
          />
        </div>

        {/* Status filter */}
        <QueueFacetedFilter
          title="Status"
          options={APPLICATION_STATUSES.map((s) => ({
            label: s.label,
            value: s.value,
            count: statusCounts[s.value] ?? 0,
          }))}
          selectedValues={status}
          onSelectionChange={(values) => {
            setFilters({ status: values.length > 0 ? values : null });
          }}
        />

        {/* Class Type filter */}
        <QueueFacetedFilter
          title="Class Type"
          options={CLASS_TYPES.map((ct) => ({
            label: ct.label,
            value: ct.value,
            count: classTypeCounts[ct.value] ?? 0,
          }))}
          selectedValues={classType}
          onSelectionChange={(values) => {
            setFilters({ classType: values.length > 0 ? values : null });
          }}
        />

        {/* Clear filters button */}
        {hasActiveFilters && (
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
    </div>
  );
}
