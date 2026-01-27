"use client"

import { ChevronDown, FlaskConical, User } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function GovBanner() {
  return (
    <div className="bg-treasury-base-lightest">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-1">
          <img
            src="/us-flag.svg"
            alt="U.S. flag"
            className="h-3 w-4"
            aria-hidden="true"
          />
          <span className="text-treasury-ink text-xs">
            This is a prototype — not an official government website
          </span>
          <Popover>
            <PopoverTrigger className="text-treasury-primary hover:text-treasury-primary-dark flex items-center gap-1 underline text-xs group">
              Here&apos;s the context
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </PopoverTrigger>
            <PopoverContent
              align="center"
              className="w-[min(calc(100vw-2rem),48rem)] bg-treasury-base-lightest border-treasury-base-light"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-treasury-primary">
                    <FlaskConical className="h-5 w-5 text-treasury-paper" />
                  </div>
                  <div>
                    <p className="font-bold text-treasury-ink text-sm">
                      This is a demo
                    </p>
                    <p className="text-xs text-treasury-base-dark">
                      A prototype built for the{" "}
                      <strong>Treasury IT Specialist (AI)</strong> hiring
                      evaluation. Not connected to real TTB systems or data.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-treasury-secondary">
                    <User className="h-5 w-5 text-treasury-paper" />
                  </div>
                  <div>
                    <p className="font-bold text-treasury-ink text-sm">
                      Built by Gregory Johns
                    </p>
                    <p className="text-xs text-treasury-base-dark">
                      Full-stack engineer demonstrating AI integration,
                      accessible UI design, and federal design standards.
                    </p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
