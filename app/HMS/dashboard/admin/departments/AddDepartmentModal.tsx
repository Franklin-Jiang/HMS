'use client'

import React, { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
const { toast } = require('react-toastify')

interface AddDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddDepartmentModal({ isOpen, onClose, onSuccess }: AddDepartmentModalProps) {
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    Location: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/HMS/dashboard/admin/departments', {
        method: 'POST',
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
      toast.success('科室添加成功')
      onSuccess()
    } catch (error) {
      toast.error('添加失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>添加科室</ModalHeader>
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
            添加
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 