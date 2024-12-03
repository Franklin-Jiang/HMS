import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

export async function GET() {
  try {
    const doctor = await getSession()
    if (!doctor || doctor.Role !== 'doctor') {
      return NextResponse.json({ error: '需要医生权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      const [doctors] = await connection.execute(`
        SELECT 
          d.DoctorID,
          d.Name,
          d.Gender,
          d.Phone,
          dep.Name as DepartmentName
        FROM Doctors d
        LEFT JOIN Departments dep ON d.DepartmentID = dep.DepartmentID
        WHERE d.DoctorID = ?
      `, [doctor.RelatedID])

      if ((doctors as any[]).length === 0) {
        return NextResponse.json({ error: '找不到医生信息' }, { status: 404 })
      }

      return NextResponse.json({ profile: (doctors as any[])[0] })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Doctor Profile Error:', error)
    return NextResponse.json({ error: '获取个人信息失败' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const doctor = await getSession()
    if (!doctor || doctor.Role !== 'doctor') {
      return NextResponse.json({ error: '需要医生权限' }, { status: 403 })
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
        UPDATE Doctors
        SET Phone = ?
        WHERE DoctorID = ?
      `, [Phone, doctor.RelatedID])

      return NextResponse.json({ message: '联系电话更新成功' })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Update Doctor Profile Error:', error)
    return NextResponse.json({ error: '更新个人信息失败' }, { status: 500 })
  }
} 