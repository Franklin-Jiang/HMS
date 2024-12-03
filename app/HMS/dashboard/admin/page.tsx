/** @jsxImportSource react */
'use client'

import React from 'react'
import { Card, CardBody, CardHeader, Button } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../components/auth/ProtectedRoute"
import PageTitle from '@/app/HMS/components/PageTitle'
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

function AdminDashboard() {
  const [stats, setStats] = React.useState<DashboardStats>({
    patientsCount: 0,
    doctorsCount: 0,
    nursesCount: 0,
    roomsCount: 0,
    treatmentsCount: 0,
    pendingDoctorsCount: 0,
    pendingNursesCount: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const [user, setUser] = React.useState<any>(null)
  const router = useRouter()

  React.useEffect(() => {
    loadStats()
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    try {
      const response = await fetch('/api/HMS/session')
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      toast.error('加载用户信息失败')
    }
  }

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
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(`/HMS/dashboard/admin/${path}`)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/HMS/auth/logout', {
        method: 'POST'
      })
      if (response.ok) {
        toast.success('退出登录成功')
        router.push('/HMS/login')
      } else {
        toast.error('退出登录失败')
      }
    } catch (error) {
      toast.error('退出登录失败')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <PageTitle title="管理员工作台">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">管理员后台</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm">欢迎回来，{user?.Username}</div>
              <Button
                color="danger"
                variant="light"
                onPress={handleLogout}
              >
                退出登录
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="text-lg font-medium">患者总数</div>
                <div className="text-3xl font-bold mt-2">{stats.patientsCount}</div>
              </CardBody>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="text-lg font-medium">医生总数</div>
                <div className="text-3xl font-bold mt-2">{stats.doctorsCount}</div>
              </CardBody>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="text-lg font-medium">护士总数</div>
                <div className="text-3xl font-bold mt-2">{stats.nursesCount}</div>
              </CardBody>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="text-lg font-medium">病房总数</div>
                <div className="text-3xl font-bold mt-2">{stats.roomsCount}</div>
              </CardBody>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="text-lg font-medium">看病记录总数</div>
                <div className="text-3xl font-bold mt-2">{stats.treatmentsCount}</div>
              </CardBody>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              isPressable
              onPress={() => handleNavigation('pending-staff')}
            >
              <CardBody>
                <div className="text-lg font-medium">待审核医护人员</div>
                <div className="text-3xl font-bold mt-2">
                  {stats.pendingDoctorsCount + stats.pendingNursesCount}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="border-b">
                <h3 className="text-lg font-medium">快速操作</h3>
              </CardHeader>
              <CardBody className="space-y-2">
                <Button
                  color="primary"
                  onPress={() => handleNavigation('pending-staff')}
                  fullWidth
                >
                  审核医护申请
                </Button>
                <Button
                  color="secondary"
                  onPress={() => handleNavigation('departments')}
                  fullWidth
                >
                  管理科室
                </Button>
                <Button
                  color="secondary"
                  onPress={() => handleNavigation('rooms')}
                  fullWidth
                >
                  管理房间
                </Button>
                <Button
                  color="secondary"
                  onPress={() => handleNavigation('doctors')}
                  fullWidth
                >
                  管理医生
                </Button>
                <Button
                  color="secondary"
                  onPress={() => handleNavigation('nurses')}
                  fullWidth
                >
                  管理护士
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </PageTitle>
    </ProtectedRoute>
  )
}
export default AdminDashboard
