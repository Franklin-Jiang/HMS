'use client'

import React, { Suspense } from 'react'
import { Card, CardBody, Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useRouter, useSearchParams } from "next/navigation"
import ProtectedRoute from "../../../../components/auth/ProtectedRoute"
const { toast } = require('react-toastify')

interface Department {
  DepartmentID: number
  Name: string
}

interface DoctorFormData {
  Name: string
  Gender: 'M' | 'F'
  Phone: string
  DepartmentID: string
}

// 创建一个包装组件来使用 useSearchParams
function EditDoctorContent() {
  const [formData, setFormData] = React.useState<DoctorFormData>({
    Name: '',
    Gender: 'M',
    Phone: '',
    DepartmentID: ''
  })
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get('id')

  const loadDoctor = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/HMS/dashboard/admin/doctors?id=${doctorId}`)
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      const doctor = data.doctor
      setFormData({
        Name: doctor.Name,
        Gender: doctor.Gender,
        Phone: doctor.Phone,
        DepartmentID: doctor.DepartmentID.toString()
      })
    } catch (error) {
      toast.error('加载医生信息失败')
    } finally {
      setIsLoading(false)
    }
  }, [doctorId])

  React.useEffect(() => {
    if (!doctorId) {
      toast.error('缺少医生ID')
      router.push('/HMS/dashboard/admin/doctors')
      return
    }
    loadDepartments()
    loadDoctor()
  }, [doctorId, loadDoctor, router])

  async function loadDepartments() {
    try {
      const response = await fetch('/api/HMS/dashboard/admin/departments')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setDepartments(data.departments)
    } catch (error) {
      toast.error('加载科室列表失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/HMS/dashboard/admin/doctors?id=${doctorId}`, {
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
      router.push('/HMS/dashboard/admin/doctors')
    } catch (error) {
      toast.error('更新医生信息失败')
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
            onPress={() => router.push('/HMS/dashboard/admin/doctors')}
          >
            返回
          </Button>
          <h1 className="text-2xl font-bold">编辑医生信息</h1>
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
              onChange={(e) => setFormData(prev => ({ ...prev, Gender: e.target.value as 'M' | 'F' }))}
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
              label="所属科室"
              selectedKeys={[formData.DepartmentID]}
              onChange={(e) => setFormData(prev => ({ ...prev, DepartmentID: e.target.value }))}
              isRequired
            >
              {departments.map(dept => (
                <SelectItem key={dept.DepartmentID} value={dept.DepartmentID.toString()}>
                  {dept.Name}
                </SelectItem>
              ))}
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
export default function EditDoctorPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Suspense fallback={<div>加载中...</div>}>
        <EditDoctorContent />
      </Suspense>
    </ProtectedRoute>
  )
} 