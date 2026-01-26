"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueueFacetedFilter } from "./queue-faceted-filter";
import { APPLICATION_STATUSES, CLASS_TYPES } from "@/lib/constants";

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

export function QueueFiltersToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const currentStatus = searchParams.get("status")?.split(",").filter(Boolean) ?? [];
  const currentClassType = searchParams.get("classType")?.split(",").filter(Boolean) ?? [];
  const currentSearch = searchParams.get("search") ?? "";

  // Local state for search input (for debouncing)
  const [searchInput, setSearchInput] = React.useState(currentSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Track if this is the initial mount
  const isInitialMount = React.useRef(true);

  const searchParamsString = searchParams.toString();

  // Update URL when debounced search changes
  React.useEffect(() => {
    // Skip the effect on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams(searchParamsString);

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    const nextQueryString = params.toString();
    const nextUrl = nextQueryString ? `?${nextQueryString}` : "/queue";
    const currentUrl = searchParamsString ? `?${searchParamsString}` : "/queue";

    if (nextUrl !== currentUrl) {
      router.push(nextUrl, { scroll: false });
    }
  }, [debouncedSearch, router, searchParamsString]);

  // Handler for filter changes
  const handleFilterChange = (key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (values.length > 0) {
      params.set(key, values.join(","));
    } else {
      params.delete(key);
    }

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "/queue", { scroll: false });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput("");
    router.push("/queue", { scroll: false });
  };

  // Check if any filters are active
  const hasActiveFilters =
    currentStatus.length > 0 || currentClassType.length > 0 || currentSearch.length > 0;

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
            className="h-8 w-[200px] pl-8 lg:w-[300px]"
          />
        </div>

        {/* Status filter */}
        <QueueFacetedFilter
          title="Status"
          options={APPLICATION_STATUSES.map((status) => ({
            label: status.label,
            value: status.value,
          }))}
          selectedValues={currentStatus}
          onSelectionChange={(values) => handleFilterChange("status", values)}
        />

        {/* Class Type filter */}
        <QueueFacetedFilter
          title="Class Type"
          options={CLASS_TYPES.map((classType) => ({
            label: classType.label,
            value: classType.value,
          }))}
          selectedValues={currentClassType}
          onSelectionChange={(values) => handleFilterChange("classType", values)}
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
