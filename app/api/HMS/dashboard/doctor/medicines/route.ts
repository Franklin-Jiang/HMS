import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

// 获取药品列表
export async function GET() {
  try {
    const doctor = await getSession()
    if (!doctor || doctor.Role !== 'doctor') {
      return NextResponse.json({ error: '需要医生权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      const [medicines] = await connection.execute(`
        SELECT 
          MedicineID,
          Name,
          Specification,
          Unit,
          Stock
        FROM Medicines
        WHERE Stock > 0
        ORDER BY Name
      `)

      return NextResponse.json({ medicines })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Medicines Error:', error)
    return NextResponse.json({ error: '获取药品列表失败' }, { status: 500 })
  }
} 