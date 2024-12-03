'use client'

import React, { Suspense } from 'react'
import { Card, CardBody, Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useRouter, useSearchParams } from "next/navigation"
import ProtectedRoute from "../../../../components/auth/ProtectedRoute"
const { toast } = require('react-toastify')

interface Room {
  RoomID: number
  RoomNumber: string
}

interface NurseFormData {
  Name: string
  Gender: 'M' | 'F'
  Phone: string
  Shift: 'morning' | 'afternoon' | 'night'
}

// 创建一个包装组件来使用 useSearchParams
function EditNurseContent() {
  const [formData, setFormData] = React.useState<NurseFormData>({
    Name: '',
    Gender: 'F',
    Phone: '',
    Shift: 'morning'
  })
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nurseId = searchParams.get('id')

  const loadNurse = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/HMS/dashboard/admin/nurses?id=${nurseId}`)
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      const nurse = data.nurse
      setFormData({
        Name: nurse.Name,
        Gender: nurse.Gender,
        Phone: nurse.Phone,
        Shift: nurse.Shift
      })
    } catch (error) {
      toast.error('加载护士信息失败')
    } finally {
      setIsLoading(false)
    }
  }, [nurseId])

  React.useEffect(() => {
    if (!nurseId) {
      toast.error('缺少护士ID')
      router.push('/HMS/dashboard/admin/nurses')
      return
    }
    loadRooms()
    loadNurse()
  }, [nurseId, loadNurse, router])

  async function loadRooms() {
    try {
      const response = await fetch('/api/HMS/dashboard/admin/rooms')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setRooms(data.rooms)
    } catch (error) {
      toast.error('加载房间列表失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nurseId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/HMS/dashboard/admin/nurses?id=${nurseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success(data.message)
      router.push('/HMS/dashboard/admin/nurses')
    } catch (error) {
      toast.error('更新护士信息失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            color="default"
            variant="light"
            onPress={() => router.push('/HMS/dashboard/admin/nurses')}
          >
            返回
          </Button>
          <h1 className="text-2xl font-bold">编辑护士信息</h1>
        </div>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="姓名"
              value={formData.Name}
              onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
              isRequired
            />
            <Select
              label="性别"
              selectedKeys={[formData.Gender]}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                Gender: e.target.value as 'M' | 'F'
              }))}
              isRequired
            >
              <SelectItem key="M" value="M">男</SelectItem>
              <SelectItem key="F" value="F">女</SelectItem>
            </Select>
            <Input
              label="联系电话"
              value={formData.Phone}
              onChange={(e) => setFormData(prev => ({ ...prev, Phone: e.target.value }))}
              isRequired
            />
            <Select
              label="班次"
              selectedKeys={[formData.Shift]}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                Shift: e.target.value as 'morning' | 'afternoon' | 'night'
              }))}
              isRequired
            >
              <SelectItem key="morning" value="morning">早班</SelectItem>
              <SelectItem key="afternoon" value="afternoon">午班</SelectItem>
              <SelectItem key="night" value="night">晚班</SelectItem>
            </Select>
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              fullWidth
            >
              保存
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

// 主组件使用 Suspense 包装内容组件
export default function EditNursePage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Suspense fallback={<div>加载中...</div>}>
        <EditNurseContent />
      </Suspense>
    </ProtectedRoute>
  )
} 