"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  ExternalLink,
  FileText,
  Twitter,
  Github,
  Linkedin,
  Home,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react"
import { GovBanner } from "@/registry/ui/gov-banner"
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
export interface NavLink {
  label: string
  href: string
  external?: boolean
}

export interface CommandItemType {
  label: string
  icon?: LucideIcon
  href?: string
  action?: () => void
  external?: boolean
}

export interface CommandGroupType {
  heading: string
  items: CommandItemType[]
}

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: "COMPONENTS", href: "/demo", external: false },
  { label: "CV", href: "https://www.gregjohns.dev", external: true },
  { label: "GITHUB", href: "https://github.com/gjohnsx", external: true },
  { label: "LINKEDIN", href: "https://linkedin.com/in/greg-johns", external: true },
  { label: "X", href: "https://x.com/gjohnsx", external: true },
]

interface PublicHeaderProps {
  title?: string
  logoSrc?: string
  logoAlt?: string
  homeHref?: string
  navLinks?: NavLink[]
  commandGroups?: CommandGroupType[]
}

export function PublicHeader({
  title = "TTB Label Verification",
  logoSrc = "/logo/app-seal/treasury.png",
  logoAlt = "Treasury",
  homeHref = "/",
  navLinks = DEFAULT_NAV_LINKS,
  commandGroups,
}: PublicHeaderProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  // Default command groups if not provided
  const defaultCommandGroups: CommandGroupType[] = [
    {
      heading: "Navigation",
      items: [
        {
          label: "Home",
          icon: Home,
          action: () => router.push(homeHref),
        },
        {
          label: "Components",
          icon: LayoutGrid,
          action: () => router.push("/demo"),
        },
      ],
    },
    {
      heading: "About Gregory Johns",
      items: [
        {
          label: "Portfolio / CV",
          icon: FileText,
          href: "https://www.gregjohns.dev",
          external: true,
        },
        {
          label: "X",
          icon: Twitter,
          href: "https://x.com/gjohnsx",
          external: true,
        },
        {
          label: "GitHub",
          icon: Github,
          href: "https://github.com/gjohnsx",
          external: true,
        },
        {
          label: "LinkedIn",
          icon: Linkedin,
          href: "https://linkedin.com/in/greg-johns",
          external: true,
        },
      ],
    },
  ]

  const groups = commandGroups ?? defaultCommandGroups

  return (
    <header>
      <GovBanner />

      {/* Main header - dark navy */}
      <div className="bg-treasury-primary-darkest">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <img
            src={logoSrc}
            alt={logoAlt}
            className="h-12 w-12 -ml-1"
          />
          <Link href={homeHref} className="text-treasury-paper text-2xl font-light">
            {title}
          </Link>
        </div>
      </div>

      {/* Nav bar - slightly lighter blue */}
      <nav className="bg-treasury-primary-dark">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 text-sm font-medium tracking-wide text-treasury-paper relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-transparent hover:after:bg-treasury-accent-light active:after:bg-treasury-accent after:transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="py-3 text-sm font-medium tracking-wide text-treasury-paper relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-transparent hover:after:bg-treasury-accent-light active:after:bg-treasury-accent after:transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-3 text-treasury-paper hover:text-treasury-base-light transition-colors"
            aria-label="Search (⌘K)"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <CommandDialog open={open} onOpenChange={setOpen}>
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
                            if (item.external) {
                              window.open(item.href, "_blank")
                            } else {
                              router.push(item.href)
                            }
                          }
                        })
                      }
                    >
                      {item.icon && <item.icon />}
                      <span className="flex-1">{item.label}</span>
                      {item.external && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  )
}
