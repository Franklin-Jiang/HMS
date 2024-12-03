import { NextResponse } from 'next/server'
import { clearSession } from '../../../../HMS/lib/auth'

export async function POST() {
  try {
    await clearSession()
    return NextResponse.json({ message: '退出登录成功' })
  } catch (error) {
    console.error('Logout Error:', error)
    return NextResponse.json({ error: '退出登录失败' }, { status: 500 })
  }
} 