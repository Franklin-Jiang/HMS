'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, useDisclosure } from "@nextui-org/react"
import { useState, useEffect } from "react"
import { Doctor } from "../../types"
import { doctorAPI } from "../../services/api"
import DoctorVerification from "./DoctorVerification"
const { toast } = require('react-toastify');

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    loadDoctors()
  }, [])

  async function loadDoctors() {
    try {
      const data = await doctorAPI.getList()
      setDoctors(data)
    } catch (error) {
      toast.error('加载医生列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    onOpen()
  }

  const handleDelete = async (id: number) => {
    try {
      await doctorAPI.delete(id, 'admin-token')
      toast.success('医生删除成功')
      loadDoctors()
    } catch (error) {
      toast.error('删除医生失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">医生列表</h3>
        <Button color="primary" onPress={() => {}}>
          添加医生
        </Button>
      </div>

      {selectedDoctor && (
        <DoctorVerification
          doctor={selectedDoctor}
          onVerified={loadDoctors}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}

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
          <TableColumn>科室</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody 
          items={doctors}
          isLoading={isLoading}
          loadingContent={<div>加载中...</div>}
          emptyContent={<div>暂无数据</div>}
        >
          {(doctor) => (
            <TableRow key={doctor.DoctorID}>
              <TableCell>{doctor.DoctorID}</TableCell>
              <TableCell>{doctor.Name}</TableCell>
              <TableCell>{doctor.Gender === 'M' ? '男' : '女'}</TableCell>
              <TableCell>{doctor.Phone}</TableCell>
              <TableCell>{doctor.DepartmentID}</TableCell>
              <TableCell className="flex gap-2">
                <Button 
                  size="sm" 
                  color="primary"
                  onPress={() => handleVerify(doctor)}
                >
                  验证资格
                </Button>
                <Button 
                  size="sm" 
                  color="danger"
                  onPress={() => handleDelete(doctor.DoctorID)}
                >
                  删除
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 