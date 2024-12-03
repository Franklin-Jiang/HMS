import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

// 获取患者列表
export async function GET() {
    try {
        const doctor = await getSession()
        if (!doctor || doctor.Role !== 'doctor') {
            return NextResponse.json({ error: '需要医生权限' }, { status: 403 })
        }

        const connection = await pool.getConnection()
        try {
            const [patients] = await connection.execute(`
        SELECT 
          PatientID,
          Name,
          Gender,
          DateOfBirth,
          Phone
        FROM Patients
        ORDER BY Name
      `)

            return NextResponse.json({ patients })
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Get Patients Error:', error)
        return NextResponse.json({ error: '获取患者列表失败' }, { status: 500 })
    }
} 