import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const miniCardVariants = cva(
  "relative overflow-hidden flex flex-col justify-end",
  {
    variants: {
      variant: {
        primary: "bg-treasury-primary",
        "primary-dark": "bg-treasury-primary-dark",
        secondary: "bg-treasury-secondary",
        "secondary-dark": "bg-treasury-secondary-dark",
        "base-dark": "bg-treasury-base-dark",
        "base-darkest": "bg-treasury-base-darkest",
      },
      size: {
        default: "p-4 min-h-[120px]",
        sm: "p-3 min-h-[80px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface MiniCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof miniCardVariants> {
  icon?: React.ReactNode
  title: string
  href?: string
}

function MiniCard({
  className,
  variant,
  size,
  icon,
  title,
  href,
  ...props
}: MiniCardProps) {
  const content = (
    <>
      {/* Treasury Seal Background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/images/treasury-seal.png')",
          backgroundPosition: "bottom right",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto 120%",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2">
        {icon && (
          <div className="text-treasury-paper [&_svg]:size-8 [&_svg]:stroke-[1.5]">
            {icon}
          </div>
        )}
        <h3 className="text-treasury-paper text-lg font-semibold leading-tight">
          {title}
        </h3>
      </div>
    </>
  )

  const cardClasses = cn(miniCardVariants({ variant, size, className }))

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          cardClasses,
          "transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-treasury-paper focus:ring-offset-2"
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    )
  }

  return (
    <div className={cardClasses} {...props}>
      {content}
    </div>
  )
}

export { MiniCard, miniCardVariants }
