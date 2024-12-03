'use client'

import React, { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react"
const { toast } = require('react-toastify')

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function AddRoomModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    RoomNumber: '',
    RoomType: 'ward' as const,
    Floor: '',
    Building: '',
    BedCount: '1',
    Description: '',
    Status: 'available' as const
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async () => {
    if (!formData.RoomNumber || !formData.Floor || !formData.BedCount) {
      toast.error('请填写所有必填字段')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/HMS/dashboard/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('房间添加成功')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('添加失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>添加房间</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="房间号"
              value={formData.RoomNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, RoomNumber: e.target.value }))}
              isRequired
            />
            <Select
              label="房间类型"
              selectedKeys={[formData.RoomType]}
              onChange={(e) => setFormData(prev => ({ ...prev, RoomType: e.target.value as typeof formData.RoomType }))}
              isRequired
            >
              <SelectItem key="ward" value="ward">普通病房</SelectItem>
              <SelectItem key="icu" value="icu">重症监护室</SelectItem>
              <SelectItem key="operating" value="operating">手术室</SelectItem>
            </Select>
            <Input
              label="楼层"
              type="number"
              value={formData.Floor}
              onChange={(e) => setFormData(prev => ({ ...prev, Floor: e.target.value }))}
              isRequired
            />
            <Input
              label="床位数"
              type="number"
              value={formData.BedCount}
              onChange={(e) => setFormData(prev => ({ ...prev, BedCount: e.target.value }))}
              isRequired
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>取消</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={isLoading}>添加</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AddRoomModal 