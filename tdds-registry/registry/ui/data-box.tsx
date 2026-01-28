import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const dataBoxVariants = cva(
  "border border-treasury-base bg-treasury-base-lightest flex flex-col",
  {
    variants: {
      size: {
        default: "min-w-[180px]",
        sm: "min-w-[120px]",
        xs: "min-w-[90px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const dataBoxLabelVariants = cva(
  "font-sans text-treasury-base-dark border-b border-treasury-base-light",
  {
    variants: {
      size: {
        default: "px-4 py-3 text-base",
        sm: "px-3 py-2 text-sm",
        xs: "px-2 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const dataBoxValueVariants = cva(
  "font-heading font-bold text-treasury-ink",
  {
    variants: {
      size: {
        default: "px-4 py-4 text-4xl",
        sm: "px-3 py-3 text-2xl",
        xs: "px-2 py-2 text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface DataBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataBoxVariants> {
  label: string
  value: string | number
}

function DataBox({
  className,
  size,
  label,
  value,
  ...props
}: DataBoxProps) {
  return (
    <div className={cn(dataBoxVariants({ size, className }))} {...props}>
      <div className={cn(dataBoxLabelVariants({ size }))}>
        {label}
      </div>
      <div className={cn(dataBoxValueVariants({ size }))}>
        {value}
      </div>
    </div>
  )
}

export { DataBox, dataBoxVariants }
