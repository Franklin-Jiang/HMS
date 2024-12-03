import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

export async function GET() {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const connection = await pool.getConnection()
        try {
            const [stats] = await connection.execute(`
                SELECT
                    (SELECT COUNT(*) FROM Patients) as patientsCount,
                    (SELECT COUNT(*) FROM Doctors WHERE isVerified = true) as doctorsCount,
                    (SELECT COUNT(*) FROM Nurses WHERE isVerified = true) as nursesCount,
                    (SELECT COUNT(*) FROM Rooms) as roomsCount,
                    (SELECT COUNT(*) FROM TreatmentRecords) as treatmentsCount,
                    (SELECT COUNT(*) FROM Doctors WHERE isVerified = false) as pendingDoctorsCount,
                    (SELECT COUNT(*) FROM Nurses WHERE isVerified = false) as pendingNursesCount
            `)

            return NextResponse.json(stats[0])
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Stats API Error:', error)
        return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
    }
}