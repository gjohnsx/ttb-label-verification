"use client"

import { useState } from "react"
import { Copy, Check, Maximize2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/registry/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/registry/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/ui/accordion"
import { DataBox } from "@/registry/ui/data-box"

type PackageManager = "pnpm" | "npm" | "yarn" | "bun"

const packageManagerCommands: Record<PackageManager, string> = {
  pnpm: "pnpm dlx shadcn@latest add",
  npm: "npx shadcn@latest add",
  yarn: "yarn dlx shadcn@latest add",
  bun: "bunx shadcn@latest add",
}

interface RegistryItem {
  name: string
  title: string
  description: string
  type: string
}

function CopyableCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mt-3">
      <div className="flex items-center bg-treasury-base-darkest rounded-[5px] p-2 pr-10">
        <code className="flex-1 text-xs text-treasury-paper font-mono truncate">
          {command}
        </code>
      </div>
      <button
        onClick={handleCopy}
        className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-[5px] bg-treasury-base-dark/50 hover:bg-treasury-base-dark text-treasury-paper/70 hover:text-treasury-paper transition-all duration-200"
        aria-label={copied ? "Copied!" : "Copy command"}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-treasury-secondary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}

export function ComponentList({ items }: { items: RegistryItem[] }) {
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm")
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null)

  const uiComponents = items
    .filter((item) => item.type === "registry:ui")
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      {/* Package Manager Selector */}
      <div className="bg-treasury-base-darkest rounded-t-[5px] inline-flex mb-8">
        {(["pnpm", "npm", "yarn", "bun"] as const).map((pm) => (
          <button
            key={pm}
            onClick={() => setPackageManager(pm)}
            className={`px-4 py-2 text-sm font-mono transition-colors ${
              packageManager === pm
                ? "text-treasury-paper border-b-2 border-treasury-paper"
                : "text-treasury-base-light hover:text-treasury-paper"
            }`}
          >
            {pm}
          </button>
        ))}
      </div>

      {/* Component Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uiComponents.map((item) => (
          <Card
            key={item.name}
            size="sm"
            className="cursor-pointer hover:border-treasury-primary transition-colors relative group"
            onClick={() => setSelectedItem(item)}
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-4 w-4 text-treasury-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-treasury-base-dark mb-1">
                {item.description}
              </p>
              <div onClick={(e) => e.stopPropagation()}>
                <CopyableCommand
                  command={`${packageManagerCommands[packageManager]} @tdds/${item.name}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-[90vw] w-full sm:max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            <DialogDescription>
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {selectedItem?.name === "accordion" && (
              <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Accordion heading</AccordionTrigger>
                  <AccordionContent>
                    We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Another Accordion heading</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that matches the other
                    components&apos; aesthetic.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Item with longer name <br/> goes in this space provided</AccordionTrigger>
                  <AccordionContent>
                    Yes. It&apos;s animated by default, but you can disable it if you
                    prefer.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            {selectedItem?.name === "data-box" && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-treasury-base-dark mb-3">Default</p>
                  <div className="flex flex-wrap gap-4">
                    <DataBox label="1 Month" value="0.10" />
                    <DataBox label="6 Month" value="1.25" />
                    <DataBox label="1 Year" value="3.50" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-treasury-base-dark mb-3">Small</p>
                  <div className="flex flex-wrap gap-4">
                    <DataBox label="1 Month" value="0.10" size="sm" />
                    <DataBox label="6 Month" value="1.25" size="sm" />
                    <DataBox label="1 Year" value="3.50" size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-treasury-base-dark mb-3">Extra Small</p>
                  <div className="flex flex-wrap gap-4">
                    <DataBox label="1 Month" value="0.10" size="xs" />
                    <DataBox label="6 Month" value="1.25" size="xs" />
                    <DataBox label="1 Year" value="3.50" size="xs" />
                  </div>
                </div>
              </div>
            )}
            {selectedItem?.name !== "accordion" && selectedItem?.name !== "data-box" && (
              <div className="flex items-center justify-center h-32 text-muted-foreground border-2 border-dashed rounded-md">
                Preview not available for {selectedItem?.name} yet.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
