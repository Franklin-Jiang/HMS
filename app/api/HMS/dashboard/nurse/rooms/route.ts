import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

export async function GET() {
  try {
    const nurse = await getSession()
    if (!nurse || nurse.Role !== 'nurse') {
      return NextResponse.json({ error: '需要护士权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      // 获取护士负责的房间及其病人信息
      const [rooms] = await connection.execute(`
        SELECT 
          r.*,
          COALESCE(
            JSON_ARRAYAGG(
              IF(p.PatientID IS NOT NULL,
                JSON_OBJECT(
                  'PatientID', p.PatientID,
                  'Name', p.Name,
                  'Gender', p.Gender,
                  'DateOfBirth', p.DateOfBirth,
                  'Phone', p.Phone,
                  'Address', p.Address,
                  'AdmissionDate', pra.StartDate,
                  'AdmissionReason', pra.Reason
                ),
                NULL
              )
            ),
            '[]'
          ) as Patients
        FROM Rooms r
        JOIN NurseRoomAssignments nra ON r.RoomID = nra.RoomID
        LEFT JOIN PatientRoomAssignments pra ON r.RoomID = pra.RoomID AND pra.EndDate IS NULL
        LEFT JOIN Patients p ON pra.PatientID = p.PatientID
        WHERE nra.NurseID = ?
        GROUP BY r.RoomID
        ORDER BY r.Building, r.Floor, r.RoomNumber
      `, [nurse.RelatedID])

      // 处理返回的数据
      const processedRooms = (rooms as any[]).map(room => ({
        ...room,
        Patients: JSON.parse(room.Patients).filter(p => p !== null)
      }))

      return NextResponse.json({ rooms: processedRooms })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Nurse Rooms Error:', error)
    return NextResponse.json({ error: '获取房间信息失败' }, { status: 500 })
  }
} 