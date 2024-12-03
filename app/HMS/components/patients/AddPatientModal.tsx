'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useState } from "react"
import { addPatient } from "../../services/patientService"
import { patientSchema, type PatientFormData } from "../../schemas/patientSchema"
const { toast } = require('react-toastify');

interface AddPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    Name: '',
    Gender: '' as 'M' | 'F',
    DateOfBirth: '',
    Phone: '',
    Address: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateField = (field: keyof PatientFormData, value: string) => {
    try {
      patientSchema.shape[field].parse(value)
      setErrors(prev => ({ ...prev, [field]: undefined }))
    } catch (error) {
      if (error instanceof Error) {
        setErrors(prev => ({ ...prev, [field]: error.message }))
      }
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      // 验证所有字段
      const validatedData = patientSchema.parse(formData)

      await addPatient(validatedData)
      toast.success('患者添加成功')
      onSuccess()
      onClose()
      // 重置表单
      setFormData({
        Name: '',
        Gender: '' as 'M' | 'F',
        DateOfBirth: '',
        Phone: '',
        Address: '',
      })
      setErrors({})
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('添加患者失败')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader>添加新患者</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label="姓名"
              value={formData.Name}
              onChange={(e) => {
                const value = e.target.value
                setFormData(prev => ({ ...prev, Name: value }))
                validateField('Name', value)
              }}
              isRequired
              errorMessage={errors.Name}
              isInvalid={!!errors.Name}
            />

            <Select
              label="性别"
              value={formData.Gender}
              onChange={(e) => {
                const value = e.target.value
                setFormData(prev => ({ ...prev, Gender: value as 'M' | 'F' }))
                validateField('Gender', value)
              }}
              isRequired
              errorMessage={errors.Gender}
              isInvalid={!!errors.Gender}
            >
              <SelectItem key="M" value="M">男</SelectItem>
              <SelectItem key="F" value="F">女</SelectItem>
            </Select>

            <Input
              label="出生日期"
              type="date"
              value={formData.DateOfBirth}
              onChange={(e) => {
                const value = e.target.value
                setFormData(prev => ({ ...prev, DateOfBirth: value }))
                validateField('DateOfBirth', value)
              }}
              isRequired
              errorMessage={errors.DateOfBirth}
              isInvalid={!!errors.DateOfBirth}
            />

            <Input
              label="联系电话"
              value={formData.Phone}
              onChange={(e) => {
                const value = e.target.value
                setFormData(prev => ({ ...prev, Phone: value }))
                validateField('Phone', value)
              }}
              isRequired
              errorMessage={errors.Phone}
              isInvalid={!!errors.Phone}
            />

            <Input
              label="地址"
              value={formData.Address}
              onChange={(e) => {
                const value = e.target.value
                setFormData(prev => ({ ...prev, Address: value }))
                validateField('Address', value)
              }}
              errorMessage={errors.Address}
              isInvalid={!!errors.Address}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
            isDisabled={isLoading}
          >
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={Object.keys(errors).length > 0}
          >
            添加
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 