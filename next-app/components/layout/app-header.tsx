"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Search, BellIcon, LogOut, User, Settings, HelpCircle, ListTodo, History, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MiniCard } from "@/components/ui/mini-card"
import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

const NAV_ITEMS = [
  { title: "Queue", url: "/queue" },
  { title: "History", url: "/history" },
]

const FOOTER_ITEMS = [
  { title: "Help", url: "/help" },
]

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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

  return (
    <header className="bg-treasury-primary-dark">
      <div className="flex items-center justify-between px-4 py-2">
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

          <Link href="/queue" className="flex items-center gap-3">
            <img
              src="/treasury-logo-color.svg"
              alt="Treasury"
              className="h-8 w-8"
            />
            <span className="text-treasury-paper text-xl font-light">
              TTB Label Verification
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandOpen(true)}
            className="text-treasury-paper hover:bg-treasury-primary/50"
            aria-label="Search (⌘K)"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-treasury-ink hover:bg-treasury-primary/50"
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5 fill-current" />
          </Button>

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
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle />
                  Help
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">
                  <LogOut />
                  Log out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 gap-0 border-r-0" closeButtonClassName="text-treasury-paper hover:bg-treasury-primary hover:text-treasury-paper">
          <MiniCard
            variant="primary"
            size="sm"
            title="TTB Label Verification"
          />

          <nav className="flex flex-col flex-1 border-t border-treasury-base-light">
            <div className="flex-1">
              {NAV_ITEMS.map((item) => (
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
              {FOOTER_ITEMS.map((item) => (
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
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-4 text-treasury-ink transition-colors hover:text-treasury-primary"
                >
                  <LogOut className="h-5 w-5" />
                  Log out
                </Link>
              </SheetClose>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <Command>
          <CommandInput placeholder="Search or jump to..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => runCommand(() => router.push("/queue"))}>
                <ListTodo />
                <span className="flex-1">Queue</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/history"))}>
                <History />
                <span className="flex-1">History</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Account">
              <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                <Settings />
                <span className="flex-1">Settings</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/help"))}>
                <HelpCircle />
                <span className="flex-1">Help</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                <LogOut />
                <span className="flex-1">Log out</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  )
}
