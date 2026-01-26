import { selectPersona } from '@/lib/auth-actions'
import { MOCK_AGENTS } from '@/lib/agents'
import { PersonaCard } from '@/components/persona-card'

export default function LoginPage() {
  return (
    <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            TTB Label Verification
          </h1>
          <p className="text-lg text-slate-600">
            AI-powered tool for TTB compliance agents to verify alcohol label
            applications faster.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-sm font-medium text-slate-500 uppercase tracking-wide mb-6">
            Select a persona to continue
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_AGENTS.map((agent) => (
              <form action={selectPersona} key={agent.id}>
                <input type="hidden" name="agentId" value={agent.id} />
                <PersonaCard name={agent.name} role={agent.role} />
              </form>
            ))}
          </div>
        </div>
    </main>
  )
}
