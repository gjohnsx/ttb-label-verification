import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "rounded-[5px] cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:bg-treasury-base-light disabled:text-treasury-base-dark [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        primary: "bg-treasury-primary text-treasury-paper hover:bg-treasury-primary-dark active:bg-treasury-primary-darkest",
        secondary: "bg-treasury-secondary text-treasury-paper hover:bg-treasury-secondary-dark active:bg-treasury-secondary-darkest",
        "primary-light": "bg-treasury-primary-light text-treasury-paper hover:bg-treasury-primary active:bg-treasury-primary-dark",
        warning: "bg-treasury-warning text-treasury-paper hover:bg-treasury-warning-dark active:bg-treasury-ink",
        base: "bg-treasury-base-dark text-treasury-paper hover:bg-treasury-base-darkest active:bg-treasury-ink",
        paper: "bg-treasury-paper text-treasury-ink hover:bg-treasury-base-light active:bg-treasury-base disabled:bg-treasury-base-darkest disabled:text-treasury-ink",
        "primary-outline": "bg-transparent text-treasury-primary border-treasury-primary hover:text-treasury-primary-dark hover:border-treasury-primary-dark active:text-treasury-primary-darkest active:border-treasury-primary-darkest disabled:bg-transparent disabled:text-treasury-base-light disabled:border-treasury-base-light",
        "paper-outline": "bg-transparent text-treasury-paper border-treasury-paper hover:bg-treasury-paper hover:text-treasury-ink hover:border-treasury-paper active:bg-transparent active:text-treasury-base active:border-treasury-base disabled:bg-transparent disabled:text-treasury-base disabled:border-treasury-base",
        "ghost": "bg-transparent text-treasury-ink hover:bg-treasury-base-light active:bg-treasury-base disabled:bg-treasury-base-darkest disabled:text-treasury-ink",
      },
      size: {
        default: "h-10 gap-1.5 px-6",
        lg: "h-12 gap-2 px-8 text-base",
        icon: "size-10",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
