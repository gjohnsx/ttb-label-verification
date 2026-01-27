"use client"

import * as React from "react"

import { cn } from "@/registry/lib/utils"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/ui/hover-card"

interface DataTableColumnCellProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | null | undefined
  maxLength?: number
  label?: string
}

export function DataTableColumnCell({
  value,
  maxLength = 30,
  label,
  className,
  ...props
}: DataTableColumnCellProps) {
  if (!value) {
    return (
      <div className={cn("text-muted-foreground", className)} {...props}>
        -
      </div>
    )
  }

  const isLong = value.length > maxLength
  const displayText = isLong ? value.slice(0, maxLength) + "..." : value

  if (!isLong) {
    return (
      <div className={className} {...props}>
        {value}
      </div>
    )
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "cursor-help underline decoration-dotted underline-offset-2",
            className
          )}
          {...props}
        >
          {displayText}
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-[300px] max-h-[300px] overflow-y-auto"
      >
        <div className="space-y-2">
          {label && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
          )}
          <p className="text-sm whitespace-pre-wrap break-words">{value}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
