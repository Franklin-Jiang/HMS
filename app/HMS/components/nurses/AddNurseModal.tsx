'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useState } from "react"
import { nurseAPI } from "../../services/api"
const { toast } = require('react-toastify');
import { NurseFormData } from "../../types"

interface AddNurseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddNurseModal({ isOpen, onClose, onSuccess }: AddNurseModalProps) {
  const [formData, setFormData] = useState<NurseFormData>({
    Name: '',
    Gender: 'M',
    Phone: '',
    RoomID: null,
    Shift: 'morning',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      await nurseAPI.add(formData)
      toast.success('护士添加成功')
      onSuccess()
      onClose()
      setFormData({
        Name: '',
        Gender: 'M',
        Phone: '',
        RoomID: null,
        Shift: 'morning',
      })
    } catch (error) {
      toast.error('添加护士失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>添加护士</ModalHeader>
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
              label="房间ID"
              type="number"
              value={formData.RoomID?.toString() || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                RoomID: e.target.value ? parseInt(e.target.value) : null 
              }))}
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