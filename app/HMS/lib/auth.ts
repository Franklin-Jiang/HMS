import { cookies } from 'next/headers'
import { UserAccount, SessionUser } from '../types'
import bcrypt from 'bcryptjs'

export async function getSession(): Promise<UserAccount | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('HMS_Session')
    if (!sessionCookie) {
      return null
    }
    return JSON.parse(sessionCookie.value) as UserAccount
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('HMS_Session', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24小时
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('HMS_Session')
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword)
} 