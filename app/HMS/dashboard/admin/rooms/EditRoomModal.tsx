'use client'

import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react"
const { toast } = require('react-toastify')
import type { Room, RoomFormData } from "../../../types"

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  room: Room | null
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSuccess, room }) => {
  const [formData, setFormData] = React.useState<RoomFormData>({
    RoomNumber: '',
    RoomType: 'ward',
    Floor: '',
    Building: '',
    BedCount: '',
    Description: '',
    Status: 'available'
  })
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (room) {
      setFormData({
        RoomNumber: room.RoomNumber,
        RoomType: room.RoomType,
        Floor: room.Floor.toString(),
        Building: room.Building,
        BedCount: room.BedCount.toString(),
        Description: room.Description || '',
        Status: room.Status
      })
    }
  }, [room])

  const handleSubmit = async () => {
    if (!room) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/HMS/dashboard/admin/rooms`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: room.RoomID,
          ...formData,
          Floor: parseInt(formData.Floor),
          BedCount: parseInt(formData.BedCount)
        }),
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('房间更新成功')
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
        <ModalHeader>编辑房间</ModalHeader>
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
              onChange={(e) => setFormData(prev => ({ ...prev, RoomType: e.target.value as RoomFormData['RoomType'] }))}
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
              label="楼栋"
              value={formData.Building}
              onChange={(e) => setFormData(prev => ({ ...prev, Building: e.target.value }))}
              isRequired
            />
            <Input
              label="床位数"
              type="number"
              value={formData.BedCount}
              onChange={(e) => setFormData(prev => ({ ...prev, BedCount: e.target.value }))}
              isRequired
            />
            <Input
              label="描述"
              value={formData.Description}
              onChange={(e) => setFormData(prev => ({ ...prev, Description: e.target.value }))}
            />
            <Select
              label="房间状态"
              selectedKeys={[formData.Status]}
              onChange={(e) => setFormData(prev => ({ ...prev, Status: e.target.value as RoomFormData['Status'] }))}
              isRequired
            >
              <SelectItem key="available" value="available">可用</SelectItem>
              <SelectItem
                key="occupied"
                value="occupied"
                isDisabled={room?.Status === 'occupied'}
              >
                占用
              </SelectItem>
              <SelectItem key="maintenance" value="maintenance">维护中</SelectItem>
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

export default EditModal 