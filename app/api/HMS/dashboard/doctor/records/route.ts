import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

// 获取诊疗记录列表
export async function GET(
  request: Request
) {
  try {
    const doctor = await getSession()
    if (!doctor || doctor.Role !== 'doctor') {
      return NextResponse.json({ error: '需要医生权限' }, { status: 403 })
    }

    const url = new URL(request.url)
    const recordId = url.searchParams.get('id')
    const connection = await pool.getConnection()

    try {
      if (recordId) {
        // 获取单条诊疗记录详情
        const [records] = await connection.execute(`
          SELECT 
            tr.*,
            p.Name as PatientName,
            p.Gender as PatientGender,
            p.DateOfBirth as PatientDateOfBirth,
            p.Phone as PatientPhone,
            p.Address as PatientAddress,
            d.Name as DoctorName,
            dep.Name as DepartmentName,
            COALESCE(
              JSON_ARRAYAGG(
                IF(tm.TreatmentMedicationID IS NOT NULL,
                  JSON_OBJECT(
                    'TreatmentMedicationID', tm.TreatmentMedicationID,
                    'MedicineID', tm.MedicineID,
                    'MedicineName', m.Name,
                    'Specification', m.Specification,
                    'Unit', m.Unit,
                    'Dosage', tm.Dosage,
                    'Frequency', tm.Frequency,
                    'Duration', tm.Duration,
                    'Notes', tm.Notes,
                    'CreatedAt', tm.CreatedAt,
                    'UpdatedAt', tm.UpdatedAt
                  ),
                  NULL
                )
              ),
              '[]'
            ) as Medications,
            COALESCE(
              JSON_ARRAYAGG(
                IF(e.ExamID IS NOT NULL,
                  JSON_OBJECT(
                    'ExamID', e.ExamID,
                    'ExamType', e.ExamType,
                    'Result', e.Result,
                    'Notes', e.Notes,
                    'Date', e.Date,
                    'CreatedAt', e.CreatedAt,
                    'UpdatedAt', e.UpdatedAt
                  ),
                  NULL
                )
              ),
              '[]'
            ) as Examinations
          FROM TreatmentRecords tr
          JOIN Patients p ON tr.PatientID = p.PatientID
          JOIN Doctors d ON tr.DoctorID = d.DoctorID
          JOIN Departments dep ON d.DepartmentID = dep.DepartmentID
          LEFT JOIN TreatmentMedications tm ON tr.RecordID = tm.RecordID
          LEFT JOIN Medicines m ON tm.MedicineID = m.MedicineID
          LEFT JOIN Examinations e ON tr.RecordID = e.RecordID
          WHERE tr.RecordID = ? AND tr.DoctorID = ?
          GROUP BY tr.RecordID
        `, [recordId, doctor.RelatedID])

        if (!(records as any[]).length) {
          return NextResponse.json({ error: '找不到诊疗记录' }, { status: 404 })
        }

        const record = (records as any[])[0]
        return NextResponse.json({
          record: {
            ...record,
            Medications: JSON.parse(record.Medications).filter((m: any) => m !== null),
            Examinations: JSON.parse(record.Examinations).filter((e: any) => e !== null)
          }
        })
      } else {
        // 获取诊疗记录列表
        const [records] = await connection.execute(`
          SELECT 
            tr.*,
            p.Name as PatientName,
            p.Gender as PatientGender,
            p.DateOfBirth as PatientDateOfBirth,
            COALESCE(
              JSON_ARRAYAGG(
                IF(tm.TreatmentMedicationID IS NOT NULL,
                  JSON_OBJECT(
                    'TreatmentMedicationID', tm.TreatmentMedicationID,
                    'MedicineID', tm.MedicineID,
                    'MedicineName', m.Name,
                    'Specification', m.Specification,
                    'Unit', m.Unit,
                    'Dosage', tm.Dosage,
                    'Frequency', tm.Frequency,
                    'Duration', tm.Duration
                  ),
                  NULL
                )
              ),
              '[]'
            ) as Medications,
            COALESCE(
              JSON_ARRAYAGG(
                IF(e.ExamID IS NOT NULL,
                  JSON_OBJECT(
                    'ExamID', e.ExamID,
                    'ExamType', e.ExamType,
                    'Result', e.Result,
                    'Date', e.Date
                  ),
                  NULL
                )
              ),
              '[]'
            ) as Examinations
          FROM TreatmentRecords tr
          JOIN Patients p ON tr.PatientID = p.PatientID
          LEFT JOIN TreatmentMedications tm ON tr.RecordID = tm.RecordID
          LEFT JOIN Medicines m ON tm.MedicineID = m.MedicineID
          LEFT JOIN Examinations e ON tr.RecordID = e.RecordID
          WHERE tr.DoctorID = ?
          GROUP BY tr.RecordID
          ORDER BY tr.Date DESC
        `, [doctor.RelatedID])

        // 处理返回的数据
        const processedRecords = (records as any[]).map(record => ({
          ...record,
          Medications: JSON.parse(record.Medications).filter((m: any) => m !== null),
          Examinations: JSON.parse(record.Examinations).filter((e: any) => e !== null)
        }))

        return NextResponse.json({ records: processedRecords })
      }
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Treatment Records Error:', error)
    return NextResponse.json({ error: '获取诊疗记录失败' }, { status: 500 })
  }
}

// 创建新的诊疗记录
export async function POST(request: Request) {
  try {
    const doctor = await getSession()
    if (!doctor || doctor.Role !== 'doctor') {
      return NextResponse.json({ error: '需要医生权限' }, { status: 403 })
    }

    const data = await request.json()
    const { PatientID, Diagnosis, Treatment, Medications, Examinations } = data

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 创建诊疗记录
      const [result] = await connection.execute(`
        INSERT INTO TreatmentRecords (PatientID, DoctorID, Date, Diagnosis, Treatment)
        VALUES (?, ?, NOW(), ?, ?)
      `, [PatientID, doctor.RelatedID, Diagnosis, Treatment])

      const recordId = (result as any).insertId

      // 添加用药记录
      if (Medications?.length) {
        const medicationValues = Medications.map(med => [
          recordId,
          parseInt(med.MedicineID),
          med.Dosage,
          med.Frequency,
          med.Duration,
          med.Notes || null
        ])
        
        const placeholders = medicationValues.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')
        const flatValues = medicationValues.flat()

        await connection.execute(`
          INSERT INTO TreatmentMedications 
          (RecordID, MedicineID, Dosage, Frequency, Duration, Notes)
          VALUES ${placeholders}
        `, flatValues)
      }

      // 添加检查记录
      if (Examinations?.length) {
        const examinationValues = Examinations.map(exam => [
          PatientID,
          doctor.RelatedID,
          recordId,
          exam.ExamType,
          exam.Result,
          exam.Notes || null,
          new Date()
        ])
        
        const placeholders = examinationValues.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')
        const flatValues = examinationValues.flat()

        await connection.execute(`
          INSERT INTO Examinations 
          (PatientID, DoctorID, RecordID, ExamType, Result, Notes, Date)
          VALUES ${placeholders}
        `, flatValues)
      }

      await connection.commit()
      return NextResponse.json({ message: '诊疗记录创建成功', recordId })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Create Treatment Record Error:', error)
    return NextResponse.json({ error: '创建诊疗记录失败' }, { status: 500 })
  }
} 