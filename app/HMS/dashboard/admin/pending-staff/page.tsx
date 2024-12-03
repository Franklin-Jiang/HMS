'use client'

import React from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Card, Select, SelectItem } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../../components/auth/ProtectedRoute"
const { toast } = require('react-toastify')

const SHIFT_MAP = {
  morning: '早班',
  afternoon: '午班',
  night: '晚班'
} as const

export default function PendingStaffPage() {
  const [staff, setStaff] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedType, setSelectedType] = React.useState('all')
  const router = useRouter()

  const loadPendingStaff = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/HMS/dashboard/admin/verify-staff?type=${selectedType}`)
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setStaff(data)
    } catch (error) {
      toast.error('加载待审核列表失败')
    } finally {
      setIsLoading(false)
    }
  }, [selectedType])

  React.useEffect(() => {
    loadPendingStaff()
  }, [loadPendingStaff])

  const handleVerify = async (id: number, role: string) => {
    if (!confirm('确定要通过此账号的审核吗？')) return

    try {
      const response = await fetch('/api/HMS/dashboard/admin/verify-staff', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, role }),
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('审核通过')
      loadPendingStaff()
    } catch (error) {
      toast.error('操作失败')
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
            <h1 className="text-2xl font-bold">待审核账号</h1>
          </div>
          <Select
            label="账号类型"
            selectedKeys={[selectedType]}
            className="max-w-xs"
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <SelectItem key="all" value="all">全部</SelectItem>
            <SelectItem key="doctor" value="doctor">医生</SelectItem>
            <SelectItem key="nurse" value="nurse">护士</SelectItem>
          </Select>
        </div>

        <Card>
          <Table
            aria-label="待审核账号列表"
            isStriped
            isHeaderSticky
            classNames={{
              wrapper: "max-h-[600px]"
            }}
          >
            <TableHeader>
              <TableColumn>姓名</TableColumn>
              <TableColumn>性别</TableColumn>
              <TableColumn>电话</TableColumn>
              <TableColumn>角色</TableColumn>
              <TableColumn>科室/班次</TableColumn>
              <TableColumn>注册时间</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody
              items={staff}
              emptyContent="暂无待审核账号"
            >
              {(item) => (
                <TableRow key={`${item.Role}-${item.ID}`}>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item.Gender === 'M' ? '男' : '女'}</TableCell>
                  <TableCell>{item.Phone}</TableCell>
                  <TableCell>{item.Role === 'doctor' ? '医生' : '护士'}</TableCell>
                  <TableCell>
                    {item.Role === 'doctor'
                      ? item.DepartmentName
                      : SHIFT_MAP[item.Shift as keyof typeof SHIFT_MAP]}
                  </TableCell>
                  <TableCell>{new Date(item.RegisterDate).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => handleVerify(item.ID, item.Role)}
                    >
                      通过审核
                    </Button>
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