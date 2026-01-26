import { PublicHeader } from '@/components/layout/public-header'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      {children}
    </div>
  )
}
