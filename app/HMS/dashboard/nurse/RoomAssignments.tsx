'use client'

import React from 'react'
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react"
import PageTitle from '../../components/PageTitle'
const { toast } = require('react-toastify')

interface Patient {
  PatientID: number
  Name: string
  Gender: 'M' | 'F'
  DateOfBirth: string
  Phone: string
  Address: string
  AdmissionDate: string
  AdmissionReason: string
}

interface Room {
  RoomID: number
  RoomNumber: string
  RoomType: 'normal' | 'icu' | 'operation' | 'ward'
  Floor: number
  Building: string
  BedCount: number
  Description?: string
  Status: 'available' | 'occupied' | 'maintenance'
  Patients: Patient[]
}

export default function RoomAssignments() {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    loadRooms()
  }, [])

  async function loadRooms() {
    try {
      const response = await fetch('/api/HMS/dashboard/nurse/rooms')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setRooms(data.rooms)
    } catch (error) {
      toast.error('加载房间信息失败')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDays = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  return (
    <PageTitle title="房间分配">
      <div className="space-y-4">
        {rooms.map(room => (
          <Card key={room.RoomID} className="w-full">
            <CardHeader className="flex justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {room.Building} {room.Floor}层 - {room.RoomNumber}
                </h3>
                <p className="text-sm text-gray-500">
                  {room.RoomType === 'ward' ? '普通病房' :
                   room.RoomType === 'icu' ? '重症监护室' : '手术室'}
                  ({room.BedCount}床)
                </p>
              </div>
              <div className={`px-2 py-1 rounded text-sm ${
                room.Status === 'available' ? 'bg-green-100 text-green-800' :
                room.Status === 'occupied' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {room.Status === 'available' ? '可用' :
                 room.Status === 'occupied' ? '占用' : '维护中'}
              </div>
            </CardHeader>
            <Divider/>
            <CardBody>
              <div className="space-y-4">
                {room.Patients.length > 0 ? (
                  room.Patients.map(patient => (
                    <div key={patient.PatientID} className="p-4 bg-gray-50 rounded">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">姓名</div>
                          <div>{patient.Name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">性别/年龄</div>
                          <div>
                            {patient.Gender === 'M' ? '男' : '女'} / 
                            {calculateAge(patient.DateOfBirth)}岁
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">联系电话</div>
                          <div>{patient.Phone}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">住院原因</div>
                          <div>{patient.AdmissionReason}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">住院时间</div>
                          <div>
                            {new Date(patient.AdmissionDate).toLocaleDateString()} 
                            ({calculateDays(patient.AdmissionDate)}天)
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">地址</div>
                          <div>{patient.Address}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">暂无病人</div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageTitle>
  )
} 