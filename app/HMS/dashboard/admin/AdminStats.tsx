'use client'

import React from 'react'
import { Card, CardBody } from "@nextui-org/react"
const { toast } = require('react-toastify')

interface DashboardStats {
  patientsCount: number
  doctorsCount: number
  nursesCount: number
  roomsCount: number
  treatmentsCount: number
  pendingDoctorsCount: number
  pendingNursesCount: number
}

export default function AdminStats() {
  const [stats, setStats] = React.useState<DashboardStats>({
    patientsCount: 0,
    doctorsCount: 0,
    nursesCount: 0,
    roomsCount: 0,
    treatmentsCount: 0,
    pendingDoctorsCount: 0,
    pendingNursesCount: 0,
  })

  React.useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const response = await fetch('/api/HMS/dashboard/admin/stats')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setStats(data)
    } catch (error) {
      toast.error('加载统计数据失败')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardBody>
          <div className="text-lg font-medium">患者总数</div>
          <div className="text-3xl font-bold mt-2">{stats.patientsCount}</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="text-lg font-medium">医生总数</div>
          <div className="text-3xl font-bold mt-2">{stats.doctorsCount}</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="text-lg font-medium">护士总数</div>
          <div className="text-3xl font-bold mt-2">{stats.nursesCount}</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="text-lg font-medium">病房总数</div>
          <div className="text-3xl font-bold mt-2">{stats.roomsCount}</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="text-lg font-medium">看病记录总数</div>
          <div className="text-3xl font-bold mt-2">{stats.treatmentsCount}</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="text-lg font-medium">待审核医护人员</div>
          <div className="text-3xl font-bold mt-2">
            {stats.pendingDoctorsCount + stats.pendingNursesCount}
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 