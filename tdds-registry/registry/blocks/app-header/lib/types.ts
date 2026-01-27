import { type LucideIcon } from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
}

export interface UserMenuItem {
  label: string
  href?: string
  icon?: LucideIcon
  action?: () => void
}

export interface CommandItem {
  label: string
  icon?: LucideIcon
  href?: string
  action?: () => void
}

export interface CommandGroup {
  heading: string
  items: CommandItem[]
}
