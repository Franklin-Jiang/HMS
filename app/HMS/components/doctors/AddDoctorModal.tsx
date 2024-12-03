'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useState } from "react"
import { doctorAPI } from "../../services/api"
const { toast } = require('react-toastify');
import { DoctorFormData } from "../../types"

interface AddDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddDoctorModal({ isOpen, onClose, onSuccess }: AddDoctorModalProps) {
  const [formData, setFormData] = useState<DoctorFormData>({
    Name: '',
    Gender: 'M',
    Phone: '',
    DepartmentID: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      await doctorAPI.add(formData)
      toast.success('医生添加成功')
      onSuccess()
      onClose()
      setFormData({
        Name: '',
        Gender: 'M',
        Phone: '',
        DepartmentID: 0,
      })
    } catch (error) {
      toast.error('添加医生失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>添加医生</ModalHeader>
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
            <Input
              label="科室ID"
              type="number"
              value={formData.DepartmentID.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, DepartmentID: parseInt(e.target.value) || 0 }))}
              isRequired
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={isLoading}>
            添加
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 