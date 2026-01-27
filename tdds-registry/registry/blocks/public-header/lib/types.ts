import { type LucideIcon } from "lucide-react"

export interface NavLink {
  label: string
  href: string
  external?: boolean
}

export interface CommandItem {
  label: string
  icon?: LucideIcon
  href?: string
  action?: () => void
  external?: boolean
}

export interface CommandGroup {
  heading: string
  items: CommandItem[]
}
