import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, ArrowRightIcon, MoreHorizontalIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("w-full", className)}
      {...props}
    >
      <Separator className="mb-4" />
      <div className="flex w-full items-center justify-between">
        {props.children}
      </div>
    </nav>
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("gap-2 flex items-center justify-center flex-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        "inline-flex items-center justify-center h-9 min-w-9 px-2 text-sm font-medium transition-colors",
        isActive
          ? "text-treasury-primary font-bold"
          : "text-treasury-base-dark hover:text-treasury-primary",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <a
      aria-label="Go to previous page"
      data-slot="pagination-previous"
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 text-treasury-base-dark hover:text-treasury-primary transition-colors",
        className
      )}
      {...props}
    >
      <ArrowLeftIcon className="h-5 w-5" />
    </a>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <a
      aria-label="Go to next page"
      data-slot="pagination-next"
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 text-treasury-base-dark hover:text-treasury-primary transition-colors",
        className
      )}
      {...props}
    >
      <ArrowRightIcon className="h-5 w-5" />
    </a>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "h-9 min-w-9 px-2 inline-flex items-center justify-center text-sm text-treasury-base-dark",
        className
      )}
      {...props}
    >
      ...
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
