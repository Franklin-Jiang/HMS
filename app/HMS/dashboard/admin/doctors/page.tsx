'use client'

import React from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Card } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../../components/auth/ProtectedRoute"
const { toast } = require('react-toastify')

interface Doctor {
  DoctorID: number
  Name: string
  Gender: 'M' | 'F'
  Phone: string
  DepartmentName: string
  isVerified: boolean
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = React.useState<Doctor[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    loadDoctors()
  }, [])

  async function loadDoctors() {
    try {
      const response = await fetch('/api/HMS/dashboard/admin/doctors')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setDoctors(data.doctors)
    } catch (error) {
      toast.error('加载医生列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (doctorId: number) => {
    router.push(`/HMS/dashboard/admin/doctors/edit?id=${doctorId}`)
  }

  const handleDelete = async (doctorId: number) => {
    if (!confirm('确定要删除这个医生吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/HMS/dashboard/admin/doctors?id=${doctorId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(data.message)
      loadDoctors()
    } catch (error) {
      toast.error('删除医生失败')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              color="default"
              variant="light"
              onPress={() => router.push('/HMS/dashboard/admin')}
            >
              返回
            </Button>
            <h1 className="text-2xl font-bold">医生管理</h1>
          </div>
        </div>

        <Card>
          <Table
            aria-label="医生列表"
            isStriped
            isHeaderSticky
            classNames={{
              wrapper: "max-h-[600px]"
            }}
          >
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>姓名</TableColumn>
              <TableColumn>性别</TableColumn>
              <TableColumn>联系电话</TableColumn>
              <TableColumn>所属科室</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody
              items={doctors}
              isLoading={isLoading}
              loadingContent={<div>加载中...</div>}
              emptyContent={<div>暂无医生</div>}
            >
              {(doctor) => (
                <TableRow key={doctor.DoctorID}>
                  <TableCell>{doctor.DoctorID}</TableCell>
                  <TableCell>{doctor.Name}</TableCell>
                  <TableCell>{doctor.Gender === 'M' ? '男' : '女'}</TableCell>
                  <TableCell>{doctor.Phone}</TableCell>
                  <TableCell>{doctor.DepartmentName}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => handleEdit(doctor.DoctorID)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleDelete(doctor.DoctorID)}
                      >
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </ProtectedRoute>
  )
} 