import { PublicHeader } from "@/registry/blocks/public-header/components/public-header"

export default function PublicHeaderDemo() {
  return (
    <div className="min-h-screen bg-treasury-base-lightest">
      <PublicHeader />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-treasury-ink mb-4">
          Public Header Demo
        </h1>
        <p className="text-treasury-base-dark mb-8">
          This is a demo of the Public Header component with default configuration.
          The header includes a government banner, main logo header, navigation bar,
          and a command palette (press ⌘K or Ctrl+K to open).
        </p>

        <div className="bg-treasury-paper p-6 rounded-lg border border-treasury-base-light">
          <h2 className="text-xl font-semibold text-treasury-ink mb-4">
            Configurable Props
          </h2>
          <ul className="space-y-2 text-treasury-base-darkest">
            <li><code className="bg-treasury-base-lightest px-1 rounded">title</code> - Header title text</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">logoSrc</code> - Path to logo image</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">homeHref</code> - Home link destination</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">navLinks</code> - Array of navigation links</li>
            <li><code className="bg-treasury-base-lightest px-1 rounded">commandGroups</code> - Command palette groups</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
