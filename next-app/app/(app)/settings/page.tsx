import { AppHeader } from '@/components/layout/app-header'
import { getAgent } from '@/lib/dal'
import { ResetDemoButton } from '@/components/admin/reset-demo-button'

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

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Preferences</h2>
          <p className="text-muted-foreground">
            TODO: Add notification, workflow, and accessibility settings.
          </p>
        </section>

        <hr className="border-treasury-base-light" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-treasury-warning">Demo Administration</h2>
          <p className="text-muted-foreground">
            Reset the demo database to its initial state. This will clear all reviews,
            audit events, comparisons, and OCR results. Application statuses will be
            reset to their initial values.
          </p>
          <div className="p-4 bg-treasury-warning-lightest border border-treasury-warning rounded-lg space-y-4">
            <div className="flex items-start gap-3">
              <svg className="size-6 text-treasury-warning shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div className="space-y-1">
                <p className="font-medium text-treasury-ink">
                  Caution: This action is destructive
                </p>
                <p className="text-sm text-treasury-base-darkest">
                  All user-generated data will be permanently deleted. Use only when you need to
                  reset the demo environment for a new demonstration or testing session.
                </p>
              </div>
            </div>
            <ResetDemoButton />
          </div>
        </section>
      </main>
    </>
  )
}
