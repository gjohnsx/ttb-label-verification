'use server'

import { redirect } from 'next/navigation'

/**
 * Stub logout action - replace with your auth implementation.
 *
 * Example implementation:
 * ```ts
 * import { deleteSession } from '@/lib/session'
 *
 * export async function logout(): Promise<void> {
 *   await deleteSession()
 *   redirect('/')
 * }
 * ```
 */
export async function logout(): Promise<void> {
  // TODO: Replace with your auth implementation
  // await deleteSession()
  redirect('/')
}
