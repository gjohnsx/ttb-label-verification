"use client"

import { type Table } from "@tanstack/react-table"
import { Settings2Icon, ChevronDownIcon, CheckIcon } from "lucide-react"

import { cn } from "@/registry/lib/utils"
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

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide()
    )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="hidden lg:flex items-center justify-between gap-2 border border-treasury-base-darkest bg-white h-10 rounded-none px-3 py-2 text-base shadow-xs hover:bg-muted/50 transition-colors w-[150px]">
          <div className="flex items-center gap-2">
            <Settings2Icon className="size-4" />
            <span>View</span>
          </div>
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[150px] p-0 rounded-none border border-treasury-base-darkest border-t-0 shadow-md ring-0 -mt-[1px]"
        align="end"
        sideOffset={0}
      >
        <Command className="rounded-none p-0 bg-white w-auto">
          <CommandList className="max-h-none">
            <CommandEmpty>No columns.</CommandEmpty>
            <CommandGroup className="p-0">
              {columns.map((column, index) => {
                const isVisible = column.getIsVisible()
                return (
                  <CommandItem
                    key={column.id}
                    onSelect={() => column.toggleVisibility(!isVisible)}
                    className={cn(
                      "rounded-none data-[selected=true]:bg-transparent [&>svg:last-child]:hidden px-3 py-2.5 capitalize",
                      index > 0 && "border-t border-treasury-base-darkest"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[2px] border shrink-0",
                        isVisible
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-treasury-base-darkest [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="size-3.5 !text-white" />
                    </div>
                    <span className="truncate">{column.id}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
