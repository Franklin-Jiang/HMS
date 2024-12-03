import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { UserAccount } from '../../../HMS/types'
import { pool } from '../../../HMS/lib/db'

// 从 cookie 中获取会话数据
async function getSessionData(): Promise<UserAccount | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('HMS_Session')
  if (!sessionCookie) {
    return null
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value)
    if (!sessionData?.UserID || !sessionData?.Role) {
      return null
    }
    return sessionData
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const sessionData = await getSessionData()
    if (!sessionData) {
      return NextResponse.json({ user: null })
    }

    const connection = await pool.getConnection()
    try {
      const [users] = await connection.execute(
        'SELECT UserID, Username, LOWER(Role) as Role, RelatedID FROM UserAccounts WHERE UserID = ?',
        [sessionData.UserID]
      )

      if (!(users as any[]).length) {
        return NextResponse.json({ user: null })
      }

      return NextResponse.json({ user: (users as any[])[0] })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Session Error:', error)
    return NextResponse.json({ user: null })
  }
} 