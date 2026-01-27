import { AppHeader } from "@/registry/blocks/app-header/components/app-header"

export default function AppHeaderDemo() {
  return (
    <div className="min-h-screen bg-treasury-base-lightest">
      <AppHeader
        agentName="John Smith"
        agentRole="Senior Agent"
      />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-treasury-ink mb-4">
          App Header Demo
        </h1>
        <p className="text-treasury-base-dark mb-8">
          This is a demo of the App Header component with default configuration.
          The header includes a hamburger menu, logo, search, notifications, and user menu.
          Press ⌘K or Ctrl+K to open the command palette.
        </p>

        <div className="bg-treasury-paper p-6 rounded-lg border border-treasury-base-light">
          <h2 className="text-xl font-semibold text-treasury-ink mb-4">
            Configurable Props
          </h2>
          <ul className="space-y-2 text-treasury-base-darkest">
            <li><code className="bg-treasury-base-lightest px-1 rounded">agentName</code> - Display name in user menu</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">agentRole</code> - Role displayed under name</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">title</code> - Header title text</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">logoSrc</code> - Path to logo image</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">homeHref</code> - Home link destination</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">navItems</code> - Array of navigation items</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">footerItems</code> - Array of footer nav items</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">logoutAction</code> - Server action for logout</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">showNotifications</code> - Show/hide notifications button</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">showSearch</code> - Show/hide search button</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">commandGroups</code> - Command palette groups</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
