import { AppHeader } from "@/components/layout/app-header"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-treasury-base-lightest">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
