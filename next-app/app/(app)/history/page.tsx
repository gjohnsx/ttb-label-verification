import { AppHeader } from '@/components/layout/app-header'
import { getAgent } from '@/lib/dal'

export default async function HistoryPage() {
  const agent = await getAgent()

  return (
    <>
      <AppHeader agentName={agent.name} agentRole={agent.role} />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Review History</h1>
        <p className="text-muted-foreground">
          Logged in as: {agent.name} ({agent.role})
        </p>
        <p className="text-muted-foreground mt-4">
          TODO: Add a history table of reviewed labels.
        </p>
      </main>
    </>
  )
}
