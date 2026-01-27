"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  Search,
  BellIcon,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ListTodo,
  History,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/registry/ui/button"
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/registry/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/ui/dropdown-menu"
import { MiniCard } from "@/registry/ui/mini-card"
import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/registry/ui/command"

// Types
export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
}

export interface CommandItemType {
  label: string
  icon?: LucideIcon
  href?: string
  action?: () => void
}

export interface CommandGroupType {
  heading: string
  items: CommandItemType[]
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { title: "Queue", url: "/queue" },
  { title: "History", url: "/history" },
]

const DEFAULT_FOOTER_ITEMS: NavItem[] = [
  { title: "Help", url: "/help" },
]

// Default logout stub - replace with your auth implementation
async function defaultLogout(): Promise<void> {
  console.warn("AppHeader: No logoutAction provided. Implement your own logout logic.")
}

interface AppHeaderProps {
  agentName?: string
  agentRole?: string
  title?: string
  logoSrc?: string
  logoAlt?: string
  homeHref?: string
  navItems?: NavItem[]
  footerItems?: NavItem[]
  logoutAction?: () => Promise<void>
  showNotifications?: boolean
  showSearch?: boolean
  commandGroups?: CommandGroupType[]
}

export function AppHeader({
  agentName,
  agentRole,
  title = "TTB Label Verification",
  logoSrc = "/logo/app-seal/treasury.png",
  logoAlt = "Treasury",
  homeHref = "/queue",
  navItems = DEFAULT_NAV_ITEMS,
  footerItems = DEFAULT_FOOTER_ITEMS,
  logoutAction = defaultLogout,
  showNotifications = true,
  showSearch = true,
  commandGroups,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const logoutFormRef = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setCommandOpen(false)
    command()
  }

  const submitLogout = () => {
    logoutFormRef.current?.requestSubmit()
  }

  // Default command groups if not provided
  const defaultCommandGroups: CommandGroupType[] = [
    {
      heading: "Navigation",
      items: [
        { label: "Queue", icon: ListTodo, href: "/queue" },
        { label: "History", icon: History, href: "/history" },
      ],
    },
    {
      heading: "Account",
      items: [
        { label: "Settings", icon: Settings, href: "/settings" },
        { label: "Help", icon: HelpCircle, href: "/help" },
        { label: "Log out", icon: LogOut, action: submitLogout },
      ],
    },
  ]

  const groups = commandGroups ?? defaultCommandGroups

  return (
    <header className="bg-treasury-primary-dark">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(true)}
            className="text-treasury-paper hover:bg-treasury-primary/50 h-auto w-auto p-1"
            aria-label="Open menu"
          >
            <Menu className="h-[30px] w-[30px]" />
          </Button>

          <Link href={homeHref} className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt={logoAlt}
              className="h-8 w-8"
            />
            <span className="text-treasury-paper text-xl font-light">
              {title}
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCommandOpen(true)}
              className="text-treasury-paper hover:bg-treasury-primary/50"
              aria-label="Search (⌘K)"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className="text-treasury-ink hover:bg-treasury-primary/50"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5 fill-current" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-treasury-paper hover:bg-treasury-primary/50"
                aria-label="User menu"
              >
                <User className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {agentName ? (
                <>
                  <DropdownMenuLabel className="space-y-0.5">
                    <div className="text-sm font-medium text-foreground">
                      {agentName}
                    </div>
                    {agentRole ? (
                      <div className="text-xs text-muted-foreground">
                        {agentRole}
                      </div>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help">
                    <HelpCircle />
                    Help
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <form action={logoutAction}>
                <DropdownMenuItem asChild className="w-full">
                  <button type="submit">
                    <LogOut />
                    Log out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 gap-0 border-r-0" closeButtonClassName="text-treasury-paper hover:bg-treasury-primary hover:text-treasury-paper">
          <MiniCard
            variant="primary"
            size="sm"
            title={title}
          />

          <nav className="flex flex-col flex-1 border-t border-treasury-base-light">
            <div className="flex-1">
              {navItems.map((item) => (
                <SheetClose asChild key={item.title}>
                  <Link
                    href={item.url}
                    className={`relative block px-4 py-4 border-b border-treasury-base-light transition-colors hover:text-treasury-primary ${
                      pathname === item.url
                        ? "text-treasury-primary before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-treasury-primary before:rounded-full"
                        : "text-treasury-ink"
                    }`}
                  >
                    {item.title}
                  </Link>
                </SheetClose>
              ))}
            </div>

            <div className="mt-auto border-t border-treasury-base-light">
              {footerItems.map((item) => (
                <SheetClose asChild key={item.title}>
                  <Link
                    href={item.url}
                    className={`relative block px-4 py-4 border-b border-treasury-base-light transition-colors hover:text-treasury-primary ${
                      pathname === item.url
                        ? "text-treasury-primary before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-treasury-primary before:rounded-full"
                        : "text-treasury-ink"
                    }`}
                  >
                    {item.title}
                  </Link>
                </SheetClose>
              ))}
              <form action={logoutAction}>
                <SheetClose asChild>
                  <button
                    type="submit"
                    className="flex items-center gap-3 px-4 py-4 text-treasury-ink transition-colors hover:text-treasury-primary"
                  >
                    <LogOut className="h-5 w-5" />
                    Log out
                  </button>
                </SheetClose>
              </form>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {showSearch && (
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <Command>
            <CommandInput placeholder="Search or jump to..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              {groups.map((group, groupIndex) => (
                <div key={group.heading}>
                  {groupIndex > 0 && <CommandSeparator />}
                  <CommandGroup heading={group.heading}>
                    {group.items.map((item) => (
                      <CommandItem
                        key={item.label}
                        onSelect={() =>
                          runCommand(() => {
                            if (item.action) {
                              item.action()
                            } else if (item.href) {
                              router.push(item.href)
                            }
                          })
                        }
                      >
                        {item.icon && <item.icon />}
                        <span className="flex-1">{item.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </div>
              ))}
            </CommandList>
          </Command>
        </CommandDialog>
      )}

      <form ref={logoutFormRef} action={logoutAction} className="hidden">
        <button type="submit">Log out</button>
      </form>
    </header>
  )
}
