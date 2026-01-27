"use client"

import * as React from "react"
import { type Column } from "@tanstack/react-table"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/registry/lib/utils"
import { Badge } from "@/registry/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/registry/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover"
import { Separator } from "@/registry/ui/separator"

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
  }[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 border border-treasury-base-darkest bg-transparent h-10 rounded-none px-3 py-2 text-base shadow-xs hover:bg-muted/50 transition-colors min-w-[200px]">
          <span className="flex-1 text-left">{title}</span>
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 self-stretch" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-fit min-w-[200px] p-0 rounded-none border border-treasury-base-darkest border-t-0 shadow-md ring-0"
        align="start"
        sideOffset={0}
      >
        <Command className="rounded-none p-0 bg-white">
          <CommandList
            style={{
              background: `
                linear-gradient(white 30%, rgba(255,255,255,0)),
                linear-gradient(rgba(255,255,255,0), white 70%) 0 100%,
                radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
                radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%
              `,
              backgroundRepeat: "no-repeat",
              backgroundColor: "white",
              backgroundSize: "100% 40px, 100% 40px, 100% 14px, 100% 14px",
              backgroundAttachment: "local, local, scroll, scroll",
            }}
          >
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="p-0">
              {options.map((option, index) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      )
                    }}
                    className={cn(
                      "rounded-none data-[selected=true]:bg-transparent [&>svg:last-child]:hidden px-3 py-2.5",
                      index > 0 && "border-t border-treasury-base-darkest"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[2px] border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-treasury-base-darkest [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="size-3.5 !text-white" />
                    </div>
                    <span className="flex-1">{option.label}</span>
                    {facets?.get(option.value) !== undefined && facets.get(option.value)! > 0 && (
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <CommandGroup className="p-0">
                <CommandItem
                  onSelect={() => column?.setFilterValue(undefined)}
                  className="justify-center text-center rounded-none border-t border-treasury-base-darkest data-[selected=true]:bg-transparent px-3 py-2.5"
                >
                  Clear filters
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
