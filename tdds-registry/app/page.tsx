import Link from "next/link"
import { ArrowRight, LayoutGrid, Menu, Table } from "lucide-react"
import { Button } from "@/registry/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/registry/ui/alert"
import { Badge } from "@/registry/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/registry/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/ui/tabs"
import registry from "@/registry.json"
import { SonnerShowcase } from "@/components/sonner-showcase"
import { CodeBlock } from "@/components/code-block"
import { ComponentList } from "@/components/component-list"
import { FormShowcase } from "@/components/form-showcase"

function ComponentCard({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const componentCount = registry.items.filter(
    (item) => item.type === "registry:ui"
  ).length

  return (
    <main className="min-h-screen">
      {/* Government Banner */}
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
              This is a component registry — not an official government website
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-treasury-primary-darkest text-treasury-paper py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge variant="treasury-accent" className="mb-4">
              shadcn/ui Registry
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Treasury Department Design System
            </h1>
            <p className="text-xl text-treasury-base-light mb-8">
              A collection of {componentCount}+ accessible, customizable React
              components following federal design standards. Built on shadcn/ui
              with the Treasury color palette.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="paper" size="lg">
                Get Started
              </Button>
              <Button variant="paper-outline" size="lg">
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Quick Start</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">1. Configure Registry</h3>
            <p className="text-treasury-base-dark mb-4">
              Add the TDDS registry to your <code className="bg-treasury-base-lightest px-1.5 py-0.5 rounded text-sm font-mono">components.json</code>:
            </p>
            <CodeBlock>{`{
  "registries": {
    "@tdds": "https://tdds-registry.vercel.app/r/{name}.json"
  }
}`}</CodeBlock>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">2. Install Components</h3>
            <p className="text-treasury-base-dark mb-4">
              Use the shadcn CLI to add components:
            </p>
            <CodeBlock>{`npx shadcn@latest add @tdds/button
npx shadcn@latest add @tdds/alert
npx shadcn@latest add @tdds/gov-banner`}</CodeBlock>
          </div>
        </div>

        <Alert variant="info" className="mt-8">
          <AlertTitle>Install the style first</AlertTitle>
          <AlertDescription>
            For the best experience, install the TDDS style to get all color tokens:
            <code className="block mt-2 bg-treasury-paper px-2 py-1 rounded text-sm font-mono">
              npx shadcn@latest add @tdds/tdds-style
            </code>
          </AlertDescription>
        </Alert>
      </section>

      {/* Component Showcase */}
      <section className="py-16 bg-treasury-base-lightest">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Component Showcase</h2>

          <Tabs defaultValue="buttons" className="w-full">
            <TabsList variant="uswds" className="mb-8">
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
            </TabsList>

            <TabsContent value="buttons" className="space-y-8">
              <ComponentCard
                title="Button Variants"
                description="TDDS buttons with Treasury color palette"
              >
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="primary-light">Primary Light</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="base">Base</Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary-outline">Primary Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="default">Default</Button>
                  <Button variant="primary" size="lg">Large</Button>
                </div>
              </ComponentCard>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-8">
              <ComponentCard
                title="Alert Variants"
                description="TDDS-styled alerts with left border accents"
              >
                <Alert variant="info">
                  <AlertTitle>Informational</AlertTitle>
                  <AlertDescription>
                    This is an informational alert with Treasury primary color.
                  </AlertDescription>
                </Alert>
                <Alert variant="success">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Operation completed successfully.
                  </AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Please review the changes before proceeding.
                  </AlertDescription>
                </Alert>
                <Alert variant="error">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    An error occurred. Please try again.
                  </AlertDescription>
                </Alert>
              </ComponentCard>
              <ComponentCard
                title="Toast Notifications"
                description="Sonner toasts with TDDS alert variants"
              >
                <SonnerShowcase />
              </ComponentCard>
            </TabsContent>

            <TabsContent value="badges" className="space-y-8">
              <ComponentCard
                title="Badge Variants"
                description="Treasury-themed status badges"
              >
                <div className="flex flex-wrap gap-4">
                  <Badge variant="treasury-primary">Primary</Badge>
                  <Badge variant="treasury-secondary">Secondary</Badge>
                  <Badge variant="treasury-accent">Accent</Badge>
                  <Badge variant="treasury-warning">Warning</Badge>
                  <Badge variant="treasury-base">Base</Badge>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </ComponentCard>
            </TabsContent>

            <TabsContent value="forms" className="space-y-8">
              <ComponentCard
                title="Form Components"
                description="Accessible form inputs with Treasury styling"
              >
                <FormShowcase />
              </ComponentCard>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Blocks Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Blocks</h2>
            <p className="text-treasury-base-dark mt-2">
              Pre-built, composable components for common UI patterns
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Public Header Block */}
          <Link href="/public-header-demo" className="group">
            <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-treasury-primary">
              <div className="h-40 bg-gradient-to-b from-treasury-primary-darkest to-treasury-primary-dark relative overflow-hidden">
                <div className="absolute inset-x-0 top-0">
                  <div className="bg-treasury-base-lightest h-6 flex items-center px-3">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-3 bg-treasury-primary opacity-50" />
                      <span className="text-[8px] text-treasury-base-dark">Official website</span>
                    </div>
                  </div>
                  <div className="bg-treasury-primary-darkest px-3 py-2 flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-treasury-accent/30" />
                    <span className="text-treasury-paper text-xs font-light">TTB Label Verification</span>
                  </div>
                  <div className="bg-treasury-primary-dark px-3 py-1.5 flex gap-4">
                    <span className="text-[8px] text-treasury-paper">COMPONENTS</span>
                    <span className="text-[8px] text-treasury-paper">GITHUB</span>
                    <span className="text-[8px] text-treasury-paper">LINKEDIN</span>
                  </div>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-treasury-primary" />
                  <CardTitle className="text-lg">Public Header</CardTitle>
                </div>
                <CardDescription>
                  Landing page header with government banner, navigation, and command palette
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-treasury-primary group-hover:underline">
                  View demo <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* App Header Block */}
          <Link href="/app-header-demo" className="group">
            <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-treasury-primary">
              <div className="h-40 bg-treasury-base-lightest relative overflow-hidden">
                <div className="absolute inset-x-0 top-0">
                  <div className="bg-treasury-primary-dark px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Menu className="h-4 w-4 text-treasury-paper" />
                      <div className="h-5 w-5 rounded bg-treasury-accent/30" />
                      <span className="text-treasury-paper text-xs font-light">TTB Label Verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-treasury-paper/30" />
                      <div className="h-4 w-4 rounded-full bg-treasury-paper/30" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-12 left-0 w-48 bg-treasury-paper h-28 border-r border-treasury-base-light shadow-lg">
                  <div className="bg-treasury-primary p-3">
                    <span className="text-[8px] text-treasury-paper font-medium">TTB Label Verification</span>
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="text-[8px] text-treasury-primary border-l-2 border-treasury-primary pl-2">Queue</div>
                    <div className="text-[8px] text-treasury-base-dark pl-2">History</div>
                  </div>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Menu className="h-5 w-5 text-treasury-primary" />
                  <CardTitle className="text-lg">App Header</CardTitle>
                </div>
                <CardDescription>
                  Authenticated header with mobile menu, user dropdown, and search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-treasury-primary group-hover:underline">
                  View demo <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Data Table Block */}
          <Link href="/data-table-demo" className="group">
            <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-treasury-primary">
              <div className="h-40 bg-treasury-base-lightest relative overflow-hidden p-4">
                <div className="bg-treasury-paper rounded border border-treasury-base-light h-full overflow-hidden">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-treasury-base-light">
                    <div className="h-4 w-24 bg-treasury-base-light rounded" />
                    <div className="flex gap-1">
                      <div className="h-4 w-12 bg-treasury-primary/20 rounded" />
                      <div className="h-4 w-12 bg-treasury-primary/20 rounded" />
                    </div>
                  </div>
                  <div className="space-y-0">
                    <div className="flex items-center px-2 py-1 border-b border-treasury-base-light bg-treasury-base-lightest">
                      <div className="h-2 w-2 border border-treasury-base rounded mr-2" />
                      <div className="h-2 w-16 bg-treasury-base-light rounded mr-4" />
                      <div className="h-2 w-12 bg-treasury-base-light rounded mr-4" />
                      <div className="h-2 w-8 bg-treasury-secondary/30 rounded" />
                    </div>
                    <div className="flex items-center px-2 py-1 border-b border-treasury-base-light">
                      <div className="h-2 w-2 border border-treasury-base rounded mr-2" />
                      <div className="h-2 w-20 bg-treasury-base-light rounded mr-4" />
                      <div className="h-2 w-10 bg-treasury-base-light rounded mr-4" />
                      <div className="h-2 w-8 bg-treasury-warning/30 rounded" />
                    </div>
                    <div className="flex items-center px-2 py-1 border-b border-treasury-base-light">
                      <div className="h-2 w-2 border border-treasury-base rounded mr-2" />
                      <div className="h-2 w-14 bg-treasury-base-light rounded mr-4" />
                      <div className="h-2 w-14 bg-treasury-base-light rounded mr-4" />
                      <div className="h-2 w-8 bg-treasury-primary/30 rounded" />
                    </div>
                  </div>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Table className="h-5 w-5 text-treasury-primary" />
                  <CardTitle className="text-lg">Advanced Data Table</CardTitle>
                </div>
                <CardDescription>
                  Full-featured table with search, filters, sorting, and pagination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-treasury-primary group-hover:underline">
                  View demo <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Component List */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Available Components</h2>
        <ComponentList items={registry.items} />
      </section>

      {/* Footer */}
      <footer className="bg-treasury-primary-darkest text-treasury-paper py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">TDDS Registry</h3>
              <p className="text-treasury-base-light text-sm max-w-md">
                A shadcn/ui component registry implementing the Treasury
                Department Design System for federal React applications.
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="https://ui.shadcn.com" className="text-treasury-base-light hover:text-treasury-paper hover:underline">
                shadcn/ui
              </a>
              <a href="https://designsystem.digital.gov" className="text-treasury-base-light hover:text-treasury-paper hover:underline">
                USWDS
              </a>
            </div>
          </div>
          <div className="border-t border-treasury-primary-dark mt-8 pt-6 text-center text-sm text-treasury-base-light">
            Built for the Treasury IT Specialist (AI) hiring evaluation.
            Not an official government resource.
          </div>
        </div>
      </footer>
    </main>
  )
}
