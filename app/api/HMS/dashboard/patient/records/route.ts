import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.Role !== 'patient') {
      return NextResponse.json({ error: '需要患者权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      // 首先获取基本的治疗记录
      const [records] = await connection.execute(`
        SELECT 
          tr.RecordID,
          tr.Date,
          tr.Diagnosis,
          tr.Treatment,
          tr.Status,
          d.Name as DoctorName,
          dep.Name as DepartmentName
        FROM TreatmentRecords tr
        JOIN Doctors d ON tr.DoctorID = d.DoctorID
        JOIN Departments dep ON d.DepartmentID = dep.DepartmentID
        WHERE tr.PatientID = ?
        ORDER BY tr.Date DESC
      `, [user.RelatedID])

      // 然后为每条记录获取用药信息
      const processedRecords = await Promise.all((records as any[]).map(async (record) => {
        // 获取用药信息
        const [medications] = await connection.execute(`
          SELECT 
            m.Name,
            tm.Dosage,
            tm.Frequency,
            tm.Duration
          FROM TreatmentMedications tm
          JOIN Medicines m ON tm.MedicineID = m.MedicineID
          WHERE tm.RecordID = ?
        `, [record.RecordID])

        // 获取检查结果
        const [examinations] = await connection.execute(`
          SELECT 
            ExamID,
            ExamType,
            Result,
            Notes,
            Date
          FROM Examinations
          WHERE RecordID = ?
        `, [record.RecordID])

        return {
          ...record,
          Medications: medications,
          Examinations: examinations
        }
      }))

      return NextResponse.json({ records: processedRecords })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Treatment Records Error:', error)
    return NextResponse.json({ error: '获取看病记录失败' }, { status: 500 })
  }
} 