import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// USWDS-style filled circle icons (black background, white symbol)
const AlertInfoIcon = () => (
  <svg className="size-7 shrink-0" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="var(--treasury-ink)" />
    <text x="10" y="14.5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">i</text>
  </svg>
)

const AlertWarningIcon = () => (
  <svg className="size-7 shrink-0" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="var(--treasury-ink)" />
    <text x="10" y="14.5" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="system-ui">!</text>
  </svg>
)

const AlertErrorIcon = () => (
  <svg className="size-7 shrink-0" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="var(--treasury-ink)" />
    <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const AlertSuccessIcon = () => (
  <svg className="size-7 shrink-0" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="var(--treasury-ink)" />
    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const alertVariants = cva(
  "flex gap-3 border-l-8 px-4 py-3 text-left text-sm w-full relative group/alert text-treasury-ink",
  {
    variants: {
      variant: {
        default: "border-l-treasury-base bg-treasury-base-lightest",
        info: "border-l-treasury-primary-light bg-treasury-primary-lightest",
        warning: "border-l-treasury-accent bg-treasury-accent-lightest",
        error: "border-l-treasury-warning bg-treasury-warning-lightest",
        success: "border-l-treasury-secondary bg-treasury-secondary-lightest",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const IconComponent = {
    default: null,
    info: AlertInfoIcon,
    warning: AlertWarningIcon,
    error: AlertErrorIcon,
    success: AlertSuccessIcon,
  }[variant || "default"]

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {IconComponent && <IconComponent />}
      <div className="flex-1 space-y-0.5">{children}</div>
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-semibold text-base [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-treasury-base-darkest text-sm [&_p:not(:last-child)]:mb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
