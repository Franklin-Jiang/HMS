'use client'

import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@nextui-org/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../../components/auth/ProtectedRoute"
import PageTitle from '@/app/HMS/components/PageTitle'
const { toast } = require('react-toastify');

interface PendingDoctor {
  DoctorID: number
  Name: string
  Gender: 'M' | 'F'
  Phone: string
  DepartmentName: string
  RegisterDate: string
}

export default function PendingDoctorsPage() {
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadPendingDoctors()
  }, [])

  async function loadPendingDoctors() {
    try {
      const response = await fetch('/api/HMS/dashboard/admin/pending-doctors')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setPendingDoctors(data.doctors)
    } catch (error) {
      toast.error('加载待验证医生列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (doctorId: number) => {
    try {
      const response = await fetch('/api/HMS/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          action: 'verify'
        }),
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('医生验证成功')
      loadPendingDoctors()
    } catch (error) {
      toast.error('验证失败')
    }
  }

  const handleReject = async (doctorId: number) => {
    try {
      const response = await fetch('/api/HMS/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          action: 'reject'
        }),
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('已拒绝医生注册申请')
      loadPendingDoctors()
    } catch (error) {
      toast.error('操作失败')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <PageTitle title="待审核医生">
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
              <h1 className="text-2xl font-bold">待验证医生</h1>
            </div>
          </div>

          <Card>
            <Table
              aria-label="待验证医生列表"
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
                <TableColumn>科室</TableColumn>
                <TableColumn>注册时间</TableColumn>
                <TableColumn>操作</TableColumn>
              </TableHeader>
              <TableBody
                items={pendingDoctors}
                isLoading={isLoading}
                loadingContent={<div>加载中...</div>}
                emptyContent={<div>暂无待验证医生</div>}
              >
                {(doctor) => (
                  <TableRow key={doctor.DoctorID}>
                    <TableCell>{doctor.DoctorID}</TableCell>
                    <TableCell>{doctor.Name}</TableCell>
                    <TableCell>{doctor.Gender === 'M' ? '男' : '女'}</TableCell>
                    <TableCell>{doctor.Phone}</TableCell>
                    <TableCell>{doctor.DepartmentName}</TableCell>
                    <TableCell>{new Date(doctor.RegisterDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          color="primary"
                          size="sm"
                          onPress={() => handleVerify(doctor.DoctorID)}
                        >
                          验证通过
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          variant="flat"
                          onPress={() => handleReject(doctor.DoctorID)}
                        >
                          拒绝
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </PageTitle>
    </ProtectedRoute>
  )
} 