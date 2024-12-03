import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.Role !== 'patient') {
      return NextResponse.json({ error: '需要病人权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      const [patients] = await connection.execute(`
        SELECT 
          PatientID,
          Name,
          Gender,
          DateOfBirth,
          Phone,
          Address
        FROM Patients
        WHERE PatientID = ?
      `, [user.RelatedID])

      if ((patients as any[]).length === 0) {
        return NextResponse.json({ error: '找不到病人信息' }, { status: 404 })
      }

      return NextResponse.json({ profile: patients[0] })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Patient Profile Error:', error)
    return NextResponse.json({ error: '获取个人信息失败' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSession()
    if (!user || user.Role !== 'patient') {
      return NextResponse.json({ error: '需要病人权限' }, { status: 403 })
    }

    const { Phone, Address } = await request.json()

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      await connection.execute(
        'UPDATE Patients SET Phone = ?, Address = ? WHERE PatientID = ?',
        [Phone, Address, user.RelatedID]
      )

      await connection.commit()
      return NextResponse.json({ message: '个人信息更新成功' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Update Patient Profile Error:', error)
    return NextResponse.json({ error: '更新个人信息失败' }, { status: 500 })
  }
} 