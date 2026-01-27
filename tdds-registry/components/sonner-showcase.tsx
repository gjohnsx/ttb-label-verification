"use client"

import { toast } from "sonner"

import { Button } from "@/registry/ui/button"

export function SonnerShowcase() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={() =>
            toast.info("Informational update", {
              description: "This is an info toast with Treasury styling.",
            })
          }
        >
          Show info
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.success("Successfully saved", {
              description: "Your changes have been recorded.",
            })
          }
        >
          Show success
        </Button>
        <Button
          variant="warning"
          onClick={() =>
            toast.warning("Needs attention", {
              description: "Please review this before continuing.",
            })
          }
        >
          Show warning
        </Button>
        <Button
          variant="base"
          onClick={() =>
            toast.error("Action failed", {
              description: "Something went wrong. Try again.",
            })
          }
        >
          Show error
        </Button>
      </div>
    </div>
  )
}
