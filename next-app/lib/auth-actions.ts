'use server'

import { createSession, deleteSession } from './session'
import { redirect } from 'next/navigation'
import { MOCK_AGENTS } from './agents'

export async function selectPersona(formData: FormData): Promise<void> {
  const agentId = String(formData.get('agentId') || '')
  const agent = MOCK_AGENTS.find((a) => a.id === agentId)

  if (!agent) {
    throw new Error('Invalid agent')
  }

  await createSession({
    agentId: agent.id,
    agentName: agent.name,
    role: agent.role,
  })

  redirect('/queue')
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/')
}
