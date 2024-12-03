'use client'

import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox } from "@nextui-org/react"
import { Nurse, Room } from "../../../types"
const { toast } = require('react-toastify')

interface AssignRoomsModalProps {
  isOpen: boolean
  onClose: () => void
  nurse: Nurse | null
  onSuccess: () => void
}

export default function AssignRoomsModal({ isOpen, onClose, nurse, onSuccess }: AssignRoomsModalProps) {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [selectedRooms, setSelectedRooms] = React.useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = React.useState(false)

  // 加载所有房间
  React.useEffect(() => {
    loadRooms()
  }, [])

  // 设置当前分配的房间
  React.useEffect(() => {
    if (nurse?.AssignedRooms && Array.isArray(nurse.AssignedRooms)) {
      setSelectedRooms(new Set(nurse.AssignedRooms.map(room => room.RoomID)))
    } else {
      setSelectedRooms(new Set())
    }
  }, [nurse])

  async function loadRooms() {
    try {
      const response = await fetch('/api/HMS/dashboard/admin/rooms')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setRooms(data.rooms)
    } catch (error) {
      toast.error('加载房间列表失败')
    }
  }

  const handleSelectionChange = (roomId: number) => {
    const newSelection = new Set(selectedRooms)
    if (newSelection.has(roomId)) {
      newSelection.delete(roomId)
    } else {
      newSelection.add(roomId)
    }
    setSelectedRooms(newSelection)
  }

  const handleSubmit = async () => {
    if (!nurse) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/HMS/dashboard/admin/nurses?action=assign-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nurseId: nurse.NurseID,
          roomIds: Array.from(selectedRooms)
        }),
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('房间分配成功')
      onSuccess()
    } catch (error) {
      toast.error('房间分配失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>分配房间 - {nurse?.Name}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {rooms.map(room => (
                <Checkbox
                  key={room.RoomID}
                  isSelected={selectedRooms.has(room.RoomID)}
                  onValueChange={() => handleSelectionChange(room.RoomID)}
                >
                  {room.RoomNumber}
                  <div className="text-xs text-gray-500">
                    {room.RoomType === 'ward' ? '普通病房' :
                      room.RoomType === 'icu' ? '重症监护' : '手术室'}
                  </div>
                </Checkbox>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>取消</Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={selectedRooms.size === 0}
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 