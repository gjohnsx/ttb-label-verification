"use client"

import { useState } from "react"
import { Copy, Check, Maximize2, Mail, Bell, User, Home, Info } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/registry/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/registry/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/ui/accordion"
import { Button } from "@/registry/ui/button"
import { Badge } from "@/registry/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/registry/ui/alert"
import { Input } from "@/registry/ui/input"
import { Textarea } from "@/registry/ui/textarea"
import { Checkbox } from "@/registry/ui/checkbox"
import { Label } from "@/registry/ui/label"
import { Progress } from "@/registry/ui/progress"
import { Separator } from "@/registry/ui/separator"
import { Skeleton } from "@/registry/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/registry/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/ui/breadcrumb"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/ui/hover-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/ui/dropdown-menu"
import { Kbd } from "@/registry/ui/kbd"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/ui/pagination"
import { ButtonGroup, ButtonGroupText } from "@/registry/ui/button-group"
import { GovBanner } from "@/registry/ui/gov-banner"
import { toast } from "sonner"

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
      <div className="flex items-center bg-treasury-base-darkest p-2 pr-10">
        <code className="flex-1 text-xs text-treasury-paper font-mono truncate">
          {command}
        </code>
      </div>
      <button
        onClick={handleCopy}
        className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 bg-treasury-base-dark/50 hover:bg-treasury-base-dark text-treasury-paper/70 hover:text-treasury-paper transition-all duration-200"
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

// Component previews for the dialog
function ComponentPreview({ name }: { name: string }) {
  switch (name) {
    case "accordion":
      return (
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Accordion heading</AccordionTrigger>
            <AccordionContent>
              We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Another heading</AccordionTrigger>
            <AccordionContent>
              Yes. It comes with default styles that matches the other components&apos; aesthetic.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "alert":
      return (
        <div className="space-y-4">
          <Alert variant="info">
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>This is an informational message.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Operation completed successfully.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>Please review before proceeding.</AlertDescription>
          </Alert>
          <Alert variant="error">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>An error occurred.</AlertDescription>
          </Alert>
        </div>
      )

    case "alert-dialog":
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="warning">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="base">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

    case "badge":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge variant="treasury-primary">Primary</Badge>
          <Badge variant="treasury-secondary">Secondary</Badge>
          <Badge variant="treasury-accent">Accent</Badge>
          <Badge variant="treasury-warning">Warning</Badge>
          <Badge variant="treasury-base">Base</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      )

    case "breadcrumb":
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )

    case "button":
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="base">Base</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary-outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      )

    case "button-group":
      return (
        <div className="space-y-4">
          <ButtonGroup>
            <Button variant="primary-outline">Left</Button>
            <Button variant="primary-outline">Center</Button>
            <Button variant="primary-outline">Right</Button>
          </ButtonGroup>
          <ButtonGroup>
            <ButtonGroupText>Day</ButtonGroupText>
            <ButtonGroupText>Week</ButtonGroupText>
            <ButtonGroupText>Month</ButtonGroupText>
          </ButtonGroup>
        </div>
      )

    case "card":
      return (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is a card component with Treasury styling. It can contain any content.
            </p>
          </CardContent>
        </Card>
      )

    case "checkbox":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="terms" defaultChecked />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="marketing" />
            <Label htmlFor="marketing">Receive marketing emails</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="disabled" disabled />
            <Label htmlFor="disabled">Disabled checkbox</Label>
          </div>
        </div>
      )

    case "dialog":
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="primary">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog component. It can be used to display content that requires user attention or interaction.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Dialog content goes here. You can add forms, information, or any other content.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )

    case "dropdown-menu":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="primary-outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

    case "hover-card":
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" className="underline">@treasury</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Treasury Department</h4>
              <p className="text-sm text-muted-foreground">
                Official U.S. Treasury Department design system components built on shadcn/ui.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>36 components</span>
                <span>•</span>
                <span>USWDS compliant</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )

    case "input":
      return (
        <div className="space-y-4">
          <Input placeholder="Enter your name" />
          <Input type="email" placeholder="Enter your email" />
          <Input disabled placeholder="Disabled input" />
        </div>
      )

    case "kbd":
      return (
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            <span className="text-sm text-muted-foreground ml-2">Command palette</span>
          </div>
          <div className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
            <span className="text-sm text-muted-foreground ml-2">Save</span>
          </div>
          <div className="flex items-center gap-1">
            <Kbd>Esc</Kbd>
            <span className="text-sm text-muted-foreground ml-2">Close</span>
          </div>
        </div>
      )

    case "label":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled-input">Disabled Field</Label>
            <Input id="disabled-input" disabled placeholder="Cannot edit" />
          </div>
        </div>
      )

    case "pagination":
      return (
        <Pagination>
          <PaginationPrevious href="#" />
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">4</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">5</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">6</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">7</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">8</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">9</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
          <PaginationNext href="#" />
        </Pagination>
      )

    case "popover":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="primary-outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensions</h4>
              <p className="text-sm text-muted-foreground">
                Set the dimensions for the layer.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      )

    case "progress":
      return (
        <div className="space-y-4 w-full">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>25%</span>
            </div>
            <Progress value={25} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Loading</span>
              <span>60%</span>
            </div>
            <Progress value={60} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Complete</span>
              <span>100%</span>
            </div>
            <Progress value={100} />
          </div>
        </div>
      )

    case "radio-group":
      return (
        <RadioGroup defaultValue="option-1">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option-1" id="option-1" />
            <Label htmlFor="option-1">Option One</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option-2" id="option-2" />
            <Label htmlFor="option-2">Option Two</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option-3" id="option-3" />
            <Label htmlFor="option-3">Option Three</Label>
          </div>
        </RadioGroup>
      )

    case "select":
      return (
        <div className="space-y-4">
          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )

    case "separator":
      return (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Section Title</h4>
            <p className="text-sm text-muted-foreground">Description text here.</p>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium">Another Section</h4>
            <p className="text-sm text-muted-foreground">More content below.</p>
          </div>
          <div className="flex items-center gap-4 h-8">
            <span className="text-sm">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Center</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Right</span>
          </div>
        </div>
      )

    case "skeleton":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <Skeleton className="h-[100px] w-full" />
        </div>
      )

    case "table":
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell><Badge variant="treasury-secondary">Active</Badge></TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell><Badge variant="treasury-primary">Pending</Badge></TableCell>
              <TableCell>User</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob Johnson</TableCell>
              <TableCell><Badge variant="treasury-base">Inactive</Badge></TableCell>
              <TableCell>Guest</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

    case "tabs":
      return (
        <Tabs defaultValue="account" className="w-full">
          <TabsList variant="uswds">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="p-4">
            Account settings and preferences.
          </TabsContent>
          <TabsContent value="password" className="p-4">
            Change your password here.
          </TabsContent>
          <TabsContent value="settings" className="p-4">
            General settings and configuration.
          </TabsContent>
        </Tabs>
      )

    case "textarea":
      return (
        <div className="space-y-4">
          <Textarea placeholder="Enter your message here..." />
          <Textarea placeholder="Disabled textarea" disabled />
        </div>
      )

    case "tooltip":
      return (
        <div className="flex gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="primary-outline" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Helpful information</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="primary-outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="primary-outline" size="icon">
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to home</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )

    case "gov-banner":
      return (
        <div className="border border-treasury-base-light overflow-hidden">
          <GovBanner />
        </div>
      )

    case "sonner":
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => toast("Default notification", { description: "This is a default toast message." })}
          >
            Default
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.success("Success!", { description: "Operation completed successfully." })}
          >
            Success
          </Button>
          <Button
            variant="warning"
            onClick={() => toast.warning("Warning", { description: "Please review before proceeding." })}
          >
            Warning
          </Button>
          <Button
            variant="base"
            onClick={() => toast.error("Error", { description: "Something went wrong." })}
          >
            Error
          </Button>
          <Button
            variant="primary-outline"
            onClick={() => toast.info("Information", { description: "Here's some helpful info." })}
          >
            Info
          </Button>
        </div>
      )

    default:
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground border-2 border-dashed">
          Preview not available for {name}.
        </div>
      )
  }
}

export function ComponentList({ items }: { items: RegistryItem[] }) {
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm")
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null)

  // Components to exclude from the demo page
  const excludedComponents = [
    "mini-card",
    "field",
    "avatar",
    "combobox",
    "command",
    "sheet",
    "sidebar",
    "input-group",
  ]

  const uiComponents = items.filter(
    (item) => item.type === "registry:ui" && !excludedComponents.includes(item.name)
  )

  return (
    <div>
      {/* Package Manager Selector */}
      <div className="bg-treasury-base-darkest inline-flex mb-8">
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
        <DialogContent className="max-w-[90vw] w-full sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            <DialogDescription>
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {selectedItem && <ComponentPreview name={selectedItem.name} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
