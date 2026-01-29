import { AppHeader } from '@/components/layout/app-header'
import { getAgent } from '@/lib/dal'
import { ResetDemoButton } from '@/components/admin/reset-demo-button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export default async function SettingsPage() {
  const agent = await getAgent()

  return (
    <>
      <AppHeader agentName={agent.name} agentRole={agent.role} />
      <main className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-muted-foreground">
            Logged in as: {agent.name} ({agent.role})
          </p>
        </div>

        <hr className="border-treasury-base-light" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-treasury-warning">Demo Administration</h2>
          <p className="text-muted-foreground">
            Reset the demo database to its initial state. This will clear all reviews,
            audit events, comparisons, and OCR results. Application statuses will be
            reset to their initial values.
          </p>
          <Alert variant="error">
            <AlertTitle>Caution: This action is destructive</AlertTitle>
            <AlertDescription>
              All user-generated data will be permanently deleted. Use only when you need to
              reset the demo environment for a new demonstration or testing session.
            </AlertDescription>
            <div className="mt-3">
              <ResetDemoButton />
            </div>
          </Alert>
        </section>
      </main>
    </>
  )
}
