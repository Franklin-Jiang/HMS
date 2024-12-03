'use client'

import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react"
import { Doctor } from "../../../types"
const { toast } = require('react-toastify')

interface EditDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  doctor: Doctor | null
  onSuccess: () => void
}

export default function EditDoctorModal({ isOpen, onClose, doctor, onSuccess }: EditDoctorModalProps) {
  const [departments, setDepartments] = React.useState([])
  const [formData, setFormData] = React.useState({
    Name: '',
    Gender: '',
    Phone: '',
    DepartmentID: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (doctor) {
      setFormData({
        Name: doctor.Name,
        Gender: doctor.Gender,
        Phone: doctor.Phone,
        DepartmentID: doctor.DepartmentID.toString()
      })
    }
  }, [doctor])

  React.useEffect(() => {
    loadDepartments()
  }, [])

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

  const handleSubmit = async () => {
    if (!doctor) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/HMS/dashboard/admin/doctors/${doctor.DoctorID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('医生信息更新成功')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('更新失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>编辑医生信息</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="姓名"
              value={formData.Name}
              onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
              isRequired
            />
            <Select
              label="性别"
              selectedKeys={[formData.Gender]}
              onChange={(e) => setFormData(prev => ({ ...prev, Gender: e.target.value }))}
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
              {departments.map((dept: any) => (
                <SelectItem key={dept.DepartmentID} value={dept.DepartmentID.toString()}>
                  {dept.Name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>取消</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={isLoading}>保存</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 