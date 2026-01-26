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
} from "lucide-react"
import { GovBanner } from "./gov-banner"
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

const NAV_LINKS = [
  { label: "COMPONENTS", href: "/demo", external: false },
  { label: "CV", href: "https://www.gregjohns.dev", external: true },
  { label: "GITHUB", href: "https://github.com/gjohnsx", external: true },
  { label: "LINKEDIN", href: "https://linkedin.com/in/greg-johns", external: true },
  { label: "X", href: "https://x.com/gjohnsx", external: true },
]

export function PublicHeader() {
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

  return (
    <header>
      <GovBanner />

      {/* Main header - dark navy */}
      <div className="bg-treasury-primary-darkest">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <img
            src="/treasury-logo-white.svg"
            alt="Treasury"
            className="h-12 w-12 -ml-1"
          />
          <Link href="/" className="text-treasury-paper text-2xl font-light">
            TTB Label Verification
          </Link>
        </div>
      </div>

      {/* Nav bar - slightly lighter blue */}
      <nav className="bg-treasury-primary-dark">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            {NAV_LINKS.map((link) =>
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

            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/"))}
              >
                <Home />
                <span className="flex-1">Home</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/demo"))}
              >
                <LayoutGrid />
                <span className="flex-1">Components</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="About Gregory Johns">
              <CommandItem
                onSelect={() =>
                  runCommand(() => window.open("https://www.gregjohns.dev", "_blank"))
                }
              >
                <FileText />
                <span className="flex-1">Portfolio / CV</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => window.open("https://x.com/gjohnsx", "_blank"))
                }
              >
                <Twitter />
                <span className="flex-1">X</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => window.open("https://github.com/gjohnsx", "_blank"))
                }
              >
                <Github />
                <span className="flex-1">GitHub</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    window.open("https://linkedin.com/in/greg-johns", "_blank")
                  )
                }
              >
                <Linkedin />
                <span className="flex-1">LinkedIn</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  )
}
