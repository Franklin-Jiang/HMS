import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

// 获取护士个人信息
export async function GET() {
  try {
    const nurse = await getSession()
    if (!nurse || nurse.Role !== 'nurse') {
      return NextResponse.json({ error: '需要护士权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      const [nurses] = await connection.execute(`
        SELECT NurseID, Name, Gender, Phone, Shift
        FROM Nurses
        WHERE NurseID = ?
      `, [nurse.RelatedID])

      if (!(nurses as any[]).length) {
        return NextResponse.json({ error: '找不到护士信息' }, { status: 404 })
      }

      return NextResponse.json({ profile: (nurses as any[])[0] })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Nurse Profile Error:', error)
    return NextResponse.json({ error: '获取个人信息失败' }, { status: 500 })
  }
}

// 更新护士个人信息
export async function PUT(request: Request) {
  try {
    const nurse = await getSession()
    if (!nurse || nurse.Role !== 'nurse') {
      return NextResponse.json({ error: '需要护士权限' }, { status: 403 })
    }

    const data = await request.json()
    const { Phone } = data

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(Phone)) {
      return NextResponse.json({ error: '请输入有效的手机号码' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.execute(`
        UPDATE Nurses
        SET Phone = ?
        WHERE NurseID = ?
      `, [Phone, nurse.RelatedID])

      return NextResponse.json({ message: '联系电话更新成功' })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Update Nurse Profile Error:', error)
    return NextResponse.json({ error: '更新个人信息失败' }, { status: 500 })
  }
} 