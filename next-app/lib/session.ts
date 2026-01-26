import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const SESSION_COOKIE = 'ttb-session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days in seconds

export interface SessionPayload {
  agentId: string
  agentName: string
  role: string
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function createSession(agent: SessionPayload): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)

  const token = await new SignJWT({ ...agent })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return {
      agentId: payload.agentId as string,
      agentName: payload.agentName as string,
      role: payload.role as string,
    }
  } catch {
    // Invalid or expired token
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
