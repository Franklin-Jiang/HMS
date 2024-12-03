import { NextResponse } from 'next/server'
import { pool } from '../../../../HMS/lib/db'
import { getSession } from '../../../../HMS/lib/auth'

export async function GET() {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'nurse') {
            return NextResponse.json({ error: '需要护士权限' }, { status: 403 })
        }

        const connection = await pool.getConnection()
        try {
            // 获取护士基本信息
            const [nurseInfo] = await connection.execute(`
        SELECT n.*, r.RoomType
        FROM Nurses n
        LEFT JOIN Rooms r ON n.RoomID = r.RoomID
        WHERE n.NurseID = ?
      `, [admin.RelatedID])

            // 获取当前房间的患者数量
            const [roomPatients] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM Patients
        WHERE RoomID = ?
      `, [nurseInfo[0].RoomID])

            // 获取今日工作任务
            const [todayTasks] = await connection.execute<any[]>(`
        SELECT *
        FROM NurseTasks
        WHERE NurseID = ? AND Date = CURDATE()
        ORDER BY Time
      `, [admin.RelatedID])

            return NextResponse.json({
                nurseInfo: nurseInfo[0],
                stats: {
                    roomPatients: roomPatients[0].count,
                    todayTasks: (todayTasks as any[]).length
                },
                todayTasks
            })

        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Nurse Dashboard API Error:', error)
        return NextResponse.json({ error: '获取数据失败' }, { status: 500 })
    }
} 