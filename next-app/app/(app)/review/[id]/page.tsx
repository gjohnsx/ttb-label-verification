import { AppHeader } from '@/components/layout/app-header'
import { getAgent } from '@/lib/dal'

type ReviewPageProps = {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const agent = await getAgent()
  const { id } = await params

  return (
    <>
      <AppHeader agentName={agent.name} agentRole={agent.role} />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Label Review</h1>
        <p className="text-muted-foreground">
          Reviewing application: {id}
        </p>
        <p className="text-muted-foreground mt-4">
          TODO: Add label comparison view.
        </p>
      </main>
    </>
  )
}
