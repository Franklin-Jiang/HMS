'use client'

import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react"
import { Nurse } from "../../../types"
const { toast } = require('react-toastify')

interface EditNurseModalProps {
  isOpen: boolean
  onClose: () => void
  nurse: Nurse | null
  onSuccess: () => void
}

export default function EditNurseModal({ isOpen, onClose, nurse, onSuccess }: EditNurseModalProps) {
  const [formData, setFormData] = React.useState({
    Name: '',
    Gender: '',
    Phone: '',
    Shift: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (nurse) {
      setFormData({
        Name: nurse.Name,
        Gender: nurse.Gender,
        Phone: nurse.Phone,
        Shift: nurse.Shift
      })
    }
  }, [nurse])

  const handleSubmit = async () => {
    if (!nurse) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/HMS/dashboard/admin/nurses/${nurse.NurseID}`, {
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
      toast.success('护士信息更新成功')
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
        <ModalHeader>编辑护士信息</ModalHeader>
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
              label="班次"
              selectedKeys={[formData.Shift]}
              onChange={(e) => setFormData(prev => ({ ...prev, Shift: e.target.value }))}
              isRequired
            >
              <SelectItem key="morning" value="morning">早班</SelectItem>
              <SelectItem key="afternoon" value="afternoon">午班</SelectItem>
              <SelectItem key="night" value="night">晚班</SelectItem>
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