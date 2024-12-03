'use client'

import React, { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
const { toast } = require('react-toastify')

interface Department {
  DepartmentID: number
  Name: string
  Description: string
  Location: string
}

interface EditDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  department: Department | null
}

export default function EditDepartmentModal({ isOpen, onClose, onSuccess, department }: EditDepartmentModalProps) {
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    Location: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (department) {
      setFormData({
        Name: department.Name,
        Description: department.Description || '',
        Location: department.Location,
      })
    }
  }, [department])

  const handleSubmit = async () => {
    if (!department) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/HMS/dashboard/admin/departments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: department.DepartmentID,
          ...formData
        }),
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('科室更新成功')
      onSuccess()
    } catch (error) {
      toast.error('更新失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>编辑科室</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="名称"
              value={formData.Name}
              onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
              isRequired
            />
            <Input
              label="描述"
              value={formData.Description}
              onChange={(e) => setFormData(prev => ({ ...prev, Description: e.target.value }))}
            />
            <Input
              label="位置"
              value={formData.Location}
              onChange={(e) => setFormData(prev => ({ ...prev, Location: e.target.value }))}
              isRequired
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
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 