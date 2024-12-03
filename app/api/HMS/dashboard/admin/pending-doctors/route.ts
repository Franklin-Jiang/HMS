import { NextResponse } from 'next/server'
import { pool } from '@/app/HMS/lib/db'
import { getSession } from '@/app/HMS/lib/auth'

export async function GET(request: Request) {
    try {
        // 验证管理员权限
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const connection = await pool.getConnection()
        try {
            // 获取待验证的医生列表
            const [doctors] = await connection.execute<any[]>(`
        SELECT 
          d.*,
          dep.Name as DepartmentName,
          ua.CreatedAt as RegisterDate
        FROM Doctors d
        JOIN UserAccounts ua ON ua.Role = 'doctor' AND ua.RelatedID = d.DoctorID
        LEFT JOIN Departments dep ON d.DepartmentID = dep.DepartmentID
        WHERE ua.isVerified = false
        ORDER BY ua.CreatedAt DESC
      `)

            return NextResponse.json({
                doctors: doctors.map((doctor) => ({
                    DoctorID: doctor.DoctorID,
                    Name: doctor.Name,
                    Gender: doctor.Gender,
                    Phone: doctor.Phone,
                    DepartmentName: doctor.DepartmentName,
                    RegisterDate: doctor.RegisterDate,
                }))
            })

        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Pending Doctors API Error:', error)
        return NextResponse.json({ error: '获取待验证医生列表失败' }, { status: 500 })
    }
}