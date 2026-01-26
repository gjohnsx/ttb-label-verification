import { getAgent } from '@/lib/dal'

export default async function QueuePage() {
  // This will redirect to / if not authenticated
  const agent = await getAgent()

  return (
    <>
      {/* Add <AppHeader agent={agent} /> here */}
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Application Queue</h1>
        <p className="text-muted-foreground">
          Logged in as: {agent.name} ({agent.role})
        </p>
        <p className="text-muted-foreground mt-4">
          TODO: Build queue table here
        </p>
      </main>
    </>
  )
}
