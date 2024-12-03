import { NextResponse } from 'next/server'
import { pool } from '../../../../HMS/lib/db'
import { getSession } from '../../../../HMS/lib/auth'

export async function GET() {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'doctor') {
            return NextResponse.json({ error: '需要医生权限' }, { status: 403 })
        }

        const connection = await pool.getConnection()
        try {
            // 获取医生基本信息
            const [doctorInfo] = await connection.execute(`
        SELECT d.*, dep.Name as DepartmentName
        FROM Doctors d
        LEFT JOIN Departments dep ON d.DepartmentID = dep.DepartmentID
        WHERE d.DoctorID = ?
      `, [admin.RelatedID])

            // 获取今日预约数量
            const [todayAppointments] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM TreatmentRecords
        WHERE DoctorID = ? AND Date = CURDATE()
      `, [admin.RelatedID])

            // 获取待处理的患者数量
            const [pendingPatients] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM TreatmentRecords
        WHERE DoctorID = ? AND Status = 'pending'
      `, [admin.RelatedID])

            // 获取最近的治疗记录
            const [recentTreatments] = await connection.execute(`
        SELECT tr.*, p.Name as PatientName
        FROM TreatmentRecords tr
        JOIN Patients p ON tr.PatientID = p.PatientID
        WHERE tr.DoctorID = ?
        ORDER BY tr.Date DESC
        LIMIT 5
      `, [admin.RelatedID])

            return NextResponse.json({
                doctorInfo: doctorInfo[0],
                stats: {
                    todayAppointments: todayAppointments[0].count,
                    pendingPatients: pendingPatients[0].count,
                },
                recentTreatments
            })

        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Doctor Dashboard API Error:', error)
        return NextResponse.json({ error: '获取数据失败' }, { status: 500 })
    }
} 