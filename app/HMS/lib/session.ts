import { cookies } from 'next/headers'
import { SessionUser } from '../types'

const SESSION_NAME = 'HMS_Session'

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_NAME)
    if (!sessionCookie) {
      return null
    }
    return JSON.parse(sessionCookie.value) as SessionUser
  } catch {
    return null
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_NAME)
} 