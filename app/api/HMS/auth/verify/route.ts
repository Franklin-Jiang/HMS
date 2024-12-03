import { NextResponse } from 'next/server'
import { pool } from '../../../../HMS/lib/db'
import { getSession } from '../../../../HMS/lib/auth'

export async function POST(request: Request) {
  try {
    const { doctorId, action = 'verify' } = await request.json()

    // 验证管理员权限
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      if (action === 'verify') {
        // 验证通过
        const [result] = await connection.execute(
          'UPDATE UserAccounts SET isVerified = true WHERE Role = "doctor" AND RelatedID = ?',
          [doctorId]
        )

        if ((result as any).affectedRows === 0) {
          return NextResponse.json({ error: '未找到指定医生' }, { status: 404 })
        }

        await connection.commit()
        return NextResponse.json({ message: '医生验证成功' })
      } else if (action === 'reject') {
        // 拒绝注册，删除相关记录
        await connection.execute(
          'DELETE FROM UserAccounts WHERE Role = "doctor" AND RelatedID = ?',
          [doctorId]
        )
        await connection.execute(
          'DELETE FROM Doctors WHERE DoctorID = ?',
          [doctorId]
        )

        await connection.commit()
        return NextResponse.json({ message: '已拒绝医生注册申请' })
      } else {
        return NextResponse.json({ error: '无效的操作类型' }, { status: 400 })
      }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Verification Error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 获取待验证的医生列表
export async function GET() {
  try {
    // 验证管理员权限
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      const [doctors] = await connection.execute(`
        SELECT d.*, ua.isVerified
        FROM Doctors d
        JOIN UserAccounts ua ON ua.Role = 'doctor' AND ua.RelatedID = d.DoctorID
        WHERE ua.isVerified = false
      `)

      return NextResponse.json({ data: doctors })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Unverified Doctors Error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 