"use client"

import * as React from "react"

import {
  Example,
  ExampleWrapper,
} from "@/components/example"
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDesc,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PlusIcon, BluetoothIcon, MoreVerticalIcon, FileIcon, FolderIcon, FolderOpenIcon, FileCodeIcon, MoreHorizontalIcon, FolderSearchIcon, SaveIcon, DownloadIcon, EyeIcon, LayoutIcon, PaletteIcon, SunIcon, MoonIcon, MonitorIcon, UserIcon, CreditCardIcon, SettingsIcon, KeyboardIcon, LanguagesIcon, BellIcon, MailIcon, ShieldIcon, HelpCircleIcon, FileTextIcon, LogOutIcon, CalendarIcon, MessageSquareIcon, ClockIcon, CompassIcon, ArchiveIcon, SettingsIcon as GearIcon } from "lucide-react"
import { MiniCard } from "@/components/ui/mini-card"
import { toast } from "sonner"

export function ComponentExample() {
  return (
    <ExampleWrapper>
      <TabsShowcase />
      <MiniCardShowcase />
      <AlertShowcase />
      <ButtonShowcase />
      <CardExample />
      <FormExample />
    </ExampleWrapper>
  )
}

function TabsShowcase() {
  return (
    <Example title="USWDS Tabs" containerClassName="md:col-span-2">
      <div className="w-full space-y-12">
        <div>
          <p className="text-sm text-muted-foreground mb-4">USWDS variant (matches design spec)</p>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList variant="uswds" className="w-full">
              <TabsTrigger value="tab1">Tab header</TabsTrigger>
              <TabsTrigger value="tab2">Tab header</TabsTrigger>
              <TabsTrigger value="tab3">Tab header</TabsTrigger>
              <TabsTrigger value="tab4">Tab header</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="p-4">
              Content for tab 1
            </TabsContent>
            <TabsContent value="tab2" className="p-4">
              Content for tab 2
            </TabsContent>
            <TabsContent value="tab3" className="p-4">
              Content for tab 3
            </TabsContent>
            <TabsContent value="tab4" className="p-4">
              Content for tab 4
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-4">Default shadcn variant</p>
          <Tabs defaultValue="default1">
            <TabsList variant="default">
              <TabsTrigger value="default1">Account</TabsTrigger>
              <TabsTrigger value="default2">Password</TabsTrigger>
              <TabsTrigger value="default3">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="default1" className="p-4">
              Account settings content
            </TabsContent>
            <TabsContent value="default2" className="p-4">
              Password settings content
            </TabsContent>
            <TabsContent value="default3" className="p-4">
              General settings content
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-4">Line variant</p>
          <Tabs defaultValue="line1">
            <TabsList variant="line">
              <TabsTrigger value="line1">Overview</TabsTrigger>
              <TabsTrigger value="line2">Analytics</TabsTrigger>
              <TabsTrigger value="line3">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="line1" className="p-4">
              Overview content
            </TabsContent>
            <TabsContent value="line2" className="p-4">
              Analytics content
            </TabsContent>
            <TabsContent value="line3" className="p-4">
              Reports content
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Example>
  )
}

function MiniCardShowcase() {
  return (
    <Example title="TDDS Mini Cards">
      <div className="w-full">
        <p className="text-sm text-muted-foreground mb-4">variations</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <MiniCard
              variant="primary"
              icon={<CalendarIcon />}
              title="Title Here"
            />
            <p className="text-sm text-muted-foreground">primary</p>
          </div>
          <div className="space-y-2">
            <MiniCard
              variant="primary-dark"
              icon={<MessageSquareIcon />}
              title="Title Here"
            />
            <p className="text-sm text-muted-foreground">primary-dark</p>
          </div>
          <div className="space-y-2">
            <MiniCard
              variant="secondary"
              icon={<ClockIcon />}
              title="Title Here"
            />
            <p className="text-sm text-muted-foreground">secondary</p>
          </div>
          <div className="space-y-2">
            <MiniCard
              variant="secondary-dark"
              icon={<CompassIcon />}
              title="Title Here"
            />
            <p className="text-sm text-muted-foreground">secondary-dark</p>
          </div>
          <div className="space-y-2">
            <MiniCard
              variant="base-dark"
              icon={<ArchiveIcon />}
              title="Title Here"
            />
            <p className="text-sm text-muted-foreground">base-dark</p>
          </div>
          <div className="space-y-2">
            <MiniCard
              variant="base-darkest"
              icon={<GearIcon />}
              title="Title Here"
            />
            <p className="text-sm text-muted-foreground">base-darkest</p>
          </div>
        </div>

        {/* Clickable example */}
        <p className="text-sm text-muted-foreground mt-8 mb-4">clickable (with hover effect)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MiniCard
            variant="primary"
            icon={<CalendarIcon />}
            title="View Calendar"
            href="#calendar"
          />
          <MiniCard
            variant="secondary"
            icon={<MessageSquareIcon />}
            title="Messages"
            href="#messages"
          />
        </div>
      </div>
    </Example>
  )
}

function AlertShowcase() {
  return (
    <Example title="USWDS Alerts (Large)">
      <div className="w-full space-y-4">
        <Alert variant="info">
          <AlertTitle>Info status</AlertTitle>
          <AlertDescription>This is a succinct, helpful message.</AlertDescription>
        </Alert>
        <Alert variant="warning">
          <AlertTitle>Warning status</AlertTitle>
          <AlertDescription>This is a succinct, helpful message.</AlertDescription>
        </Alert>
        <Alert variant="error">
          <AlertTitle>Error status</AlertTitle>
          <AlertDescription>This is a succinct, helpful message.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <AlertTitle>Success status</AlertTitle>
          <AlertDescription>This is a succinct, helpful message.</AlertDescription>
        </Alert>
      </div>
    </Example>
  )
}

function ButtonShowcase() {
  return (
    <Example title="TDDS Button Variants">
      <div className="w-full space-y-6">
        {/* Standard Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="primary-light">Primary Light</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="base">Base</Button>
        </div>

        {/* Paper & Outline (on dark background) */}
        <div className="flex flex-wrap items-center gap-4 bg-treasury-ink p-4 rounded-lg -mx-4">
          <Button variant="paper">Paper</Button>
          <Button variant="paper-outline">Paper Outline</Button>
        </div>

        {/* Primary Outline (on light background) */}
        <div className="flex items-center gap-4">
          <Button variant="primary-outline">Primary Outline</Button>
        </div>

        {/* Large Button */}
        <div className="flex items-center gap-4">
          <Button variant="primary" size="lg">Primary Large</Button>
        </div>

        {/* Toast Notifications (Thin Alerts) */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
          <Button
            variant="primary"
            onClick={() => toast.success("Success text goes here")}
          >
            Success Toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.info("Info status text goes here")}
          >
            Info Toast
          </Button>
          <Button
            variant="warning"
            onClick={() => toast.warning("Warning text goes here")}
          >
            Warning Toast
          </Button>
          <Button
            variant="base"
            onClick={() => toast.error("Error text goes here")}
          >
            Error Toast
          </Button>
        </div>
      </div>
    </Example>
  )
}

function CardExample() {
  return (
    <Example title="Card" className="items-center justify-center">
      <Card className="relative w-full max-w-sm overflow-hidden pt-0">
        <div className="bg-primary absolute inset-0 z-30 aspect-video opacity-50 mix-blend-color" />
        <img
          src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Photo by mymind on Unsplash"
          title="Photo by mymind on Unsplash"
          className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"
        />
        <CardHeader>
          <CardTitle>Observability Plus is replacing Monitoring</CardTitle>
          <CardDescription>
            Switch to the improved way to explore your data, with natural
            language. Monitoring will no longer be available on the Pro plan in
            November, 2025
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <PlusIcon data-icon="inline-start" />
                Show Dialog
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <BluetoothIcon
                  />
                </AlertDialogMedia>
                <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                <AlertDialogDesc>
                  Do you want to allow the USB accessory to connect to this
                  device?
                </AlertDialogDesc>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                <AlertDialogAction>Allow</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Badge variant="secondary" className="ml-auto">
            Warning
          </Badge>
        </CardFooter>
      </Card>
    </Example>
  )
}

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const

function FormExample() {
  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: false,
    push: true,
  })
  const [theme, setTheme] = React.useState("light")

  return (
    <Example title="Form">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVerticalIcon
                  />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>File</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <FileIcon
                    />
                    New File
                    <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FolderIcon
                    />
                    New Folder
                    <DropdownMenuShortcut>⇧⌘N</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <FolderOpenIcon
                      />
                      Open Recent
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Recent Projects</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <FileCodeIcon
                            />
                            Project Alpha
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileCodeIcon
                            />
                            Project Beta
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <MoreHorizontalIcon
                              />
                              More Projects
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem>
                                  <FileCodeIcon
                                  />
                                  Project Gamma
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileCodeIcon
                                  />
                                  Project Delta
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <FolderSearchIcon
                            />
                            Browse...
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <SaveIcon
                    />
                    Save
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <DownloadIcon
                    />
                    Export
                    <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>View</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: checked === true,
                      })
                    }
                  >
                    <EyeIcon
                    />
                    Show Sidebar
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        sms: checked === true,
                      })
                    }
                  >
                    <LayoutIcon
                    />
                    Show Status Bar
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <PaletteIcon
                      />
                      Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={theme}
                            onValueChange={setTheme}
                          >
                            <DropdownMenuRadioItem value="light">
                              <SunIcon
                              />
                              Light
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                              <MoonIcon
                              />
                              Dark
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                              <MonitorIcon
                              />
                              System
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <UserIcon
                    />
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCardIcon
                    />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <SettingsIcon
                      />
                      Settings
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <KeyboardIcon
                            />
                            Keyboard Shortcuts
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LanguagesIcon
                            />
                            Language
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <BellIcon
                              />
                              Notifications
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel>
                                    Notification Types
                                  </DropdownMenuLabel>
                                  <DropdownMenuCheckboxItem
                                    checked={notifications.push}
                                    onCheckedChange={(checked) =>
                                      setNotifications({
                                        ...notifications,
                                        push: checked === true,
                                      })
                                    }
                                  >
                                    <BellIcon
                                    />
                                    Push Notifications
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem
                                    checked={notifications.email}
                                    onCheckedChange={(checked) =>
                                      setNotifications({
                                        ...notifications,
                                        email: checked === true,
                                      })
                                    }
                                  >
                                    <MailIcon
                                    />
                                    Email Notifications
                                  </DropdownMenuCheckboxItem>
                                </DropdownMenuGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <ShieldIcon
                            />
                            Privacy & Security
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <HelpCircleIcon
                    />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileTextIcon
                    />
                    Documentation
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">
                    <LogOutIcon
                    />
                    Sign Out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="small-form-name">Name</FieldLabel>
                  <Input
                    id="small-form-name"
                    placeholder="Enter your name"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="small-form-role">Role</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="small-form-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="small-form-framework">
                  Framework
                </FieldLabel>
                <Combobox items={frameworks}>
                  <ComboboxInput
                    id="small-form-framework"
                    placeholder="Select a framework"
                    required
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
              <Field>
                <FieldLabel htmlFor="small-form-comments">Comments</FieldLabel>
                <Textarea
                  id="small-form-comments"
                  placeholder="Add any additional comments"
                />
              </Field>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button variant="paper" type="button">
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </Example>
  )
}
