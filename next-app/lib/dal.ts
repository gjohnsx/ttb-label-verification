import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession, SessionPayload } from './session'

// Memoized session verification - redirects to login if no session
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session) {
    redirect('/')
  }
  return session
})

// Get current agent info (requires valid session)
export const getAgent = cache(async () => {
  const session = await verifySession()
  return {
    id: session.agentId,
    name: session.agentName,
    role: session.role,
  }
})

// Check if user is authenticated (doesn't redirect)
export const isAuthenticated = cache(async (): Promise<boolean> => {
  const session = await getSession()
  return session !== null
})
