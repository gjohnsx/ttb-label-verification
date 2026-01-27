"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Loader2Icon } from "lucide-react"

// USWDS-style filled circle icons (black background, white symbol)
const InfoIcon = () => (
  <svg className="size-6 shrink-0" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="var(--treasury-ink)" />
    <text x="10" y="14.5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">i</text>
  </svg>
)

const WarningIcon = () => (
  <svg className="size-6 shrink-0" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="var(--treasury-ink)" />
    <text x="10" y="14.5" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="system-ui">!</text>
  </svg>
)

const ErrorIcon = () => (
  <svg className="size-6 shrink-0" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="var(--treasury-ink)" />
    <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const SuccessIcon = () => (
  <svg className="size-6 shrink-0" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="var(--treasury-ink)" />
    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <SuccessIcon />,
        info: <InfoIcon />,
        warning: <WarningIcon />,
        error: <ErrorIcon />,
        loading: <Loader2Icon className="size-5 animate-spin text-treasury-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "flex items-center gap-3 w-full min-w-[360px] px-4 py-3 text-treasury-ink border-l-8 border-treasury-base-light bg-treasury-base-lightest shadow-sm",
          title: "text-base font-normal",
          description: "text-base text-treasury-ink",
          actionButton: "bg-treasury-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-treasury-primary-dark",
          cancelButton: "bg-treasury-base-light text-treasury-ink px-3 py-1.5 text-sm font-medium hover:bg-treasury-base",
          closeButton: "text-treasury-base-dark hover:text-treasury-ink",
          success: "!border-l-treasury-secondary !bg-treasury-secondary-lightest",
          error: "!border-l-treasury-warning !bg-treasury-warning-lightest",
          warning: "!border-l-treasury-accent !bg-treasury-accent-lightest",
          info: "!border-l-treasury-primary-light !bg-treasury-primary-lightest",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
