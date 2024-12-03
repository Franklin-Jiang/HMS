'use client'

import React from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, CardBody } from "@nextui-org/react"
const { toast } = require('react-toastify')

interface Medication {
  Name: string
  Specification: string
  Unit: string
  Dosage: string
  Frequency: string
  Duration: string
  Notes?: string
}

interface Examination {
  ExamID: number
  ExamType: string
  Result: string
  Notes?: string
  Date: string
  CreatedAt: string
  UpdatedAt: string
}

interface TreatmentRecord {
  RecordID: number
  PatientID: number
  DoctorID: number
  Date: string
  Diagnosis: string
  Treatment: string
  Status: 'ongoing' | 'completed'
  DoctorName: string
  DepartmentName: string
  CreatedAt: string
  UpdatedAt: string
  Medications: Medication[]
  Examinations: Examination[]
}

export default function TreatmentRecords() {
  const [records, setRecords] = React.useState<TreatmentRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    loadRecords()
  }, [])

  async function loadRecords() {
    try {
      const response = await fetch('/api/HMS/dashboard/patient/records')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setRecords(data.records)
    } catch (error) {
      toast.error('加载看病记录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableColumn>就诊日期</TableColumn>
        <TableColumn>主治医生</TableColumn>
        <TableColumn>科室</TableColumn>
        <TableColumn>诊断结果</TableColumn>
        <TableColumn>治疗方案</TableColumn>
        <TableColumn>用药记录</TableColumn>
        <TableColumn>检查记录</TableColumn>
      </TableHeader>
      <TableBody
        items={records}
        emptyContent={isLoading ? "加载中..." : "暂无看病记录"}
      >
        {(record: TreatmentRecord) => (
          <TableRow key={record.RecordID}>
            <TableCell>{new Date(record.Date).toLocaleString()}</TableCell>
            <TableCell>{record.DoctorName}</TableCell>
            <TableCell>{record.DepartmentName}</TableCell>
            <TableCell>
              <div className="whitespace-pre-wrap">{record.Diagnosis}</div>
            </TableCell>
            <TableCell>
              <div className="whitespace-pre-wrap">{record.Treatment}</div>
            </TableCell>
            <TableCell>
              <ul className="list-disc list-inside">
                {record.Medications?.map((med, index) => (
                  <li key={index}>
                    {med.Name} - {med.Dosage}
                    <br />
                    <small className="text-gray-500">
                      {med.Frequency}, {med.Duration}
                    </small>
                  </li>
                ))}
              </ul>
            </TableCell>
            <TableCell>
              {record.Examinations?.map((exam, index) => (
                <div key={index} className="mb-2">
                  <div className="font-medium">{exam.ExamType}</div>
                  <div>结果：{exam.Result}</div>
                  {exam.Notes && <div>备注：{exam.Notes}</div>}
                  <div className="text-xs text-gray-500">
                    检查日期：{new Date(exam.Date).toLocaleString()}
                  </div>
                </div>
              ))}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
} 