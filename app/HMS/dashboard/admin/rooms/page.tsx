'use client'

import React from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Card, useDisclosure } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../../components/auth/ProtectedRoute"
import { Room } from "../../../types"
import AddRoom from "./AddRoomModal"
import EditRoom from "./EditRoomModal"
const { toast } = require('react-toastify')

// 本地定义房间状态映射
const ROOM_STATUS_MAP = {
  available: '可用',
  occupied: '占用',
  maintenance: '维护中'
} as const

const ROOM_TYPE_MAP = {
  ward: '普通病房',
  icu: '重症监护室',
  operating: '手术室'
} as const

export default function RoomsPage() {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure()
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose
  } = useDisclosure()

  React.useEffect(() => {
    loadRooms()
  }, [])

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
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (room: Room) => {
    setSelectedRoom(room)
    onEditOpen()
  }

  const handleDelete = async (roomId: number) => {
    if (!confirm('确定要删除这个房间吗？')) return

    try {
      const response = await fetch(`/api/HMS/dashboard/admin/rooms?id=${roomId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('房间删除成功')
      loadRooms()
    } catch (error) {
      toast.error('删除失败')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              color="default"
              variant="light"
              onPress={() => router.push('/HMS/dashboard/admin')}
            >
              返回
            </Button>
            <h1 className="text-2xl font-bold">房间管理</h1>
          </div>
          <Button
            color="primary"
            onPress={onAddOpen}
          >
            添加房间
          </Button>
        </div>

        <Card>
          <Table
            aria-label="房间列表"
            isStriped
            isHeaderSticky
            classNames={{
              wrapper: "max-h-[600px]"
            }}
          >
            <TableHeader>
              <TableColumn>房间号</TableColumn>
              <TableColumn>类型</TableColumn>
              <TableColumn>楼层</TableColumn>
              <TableColumn>楼栋</TableColumn>
              <TableColumn>床位数</TableColumn>
              <TableColumn>状态</TableColumn>
              <TableColumn>描述</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody
              items={rooms}
              isLoading={isLoading}
              loadingContent={<div>加载中...</div>}
              emptyContent={<div>暂无房间</div>}
            >
              {(room) => (
                <TableRow key={room.RoomID}>
                  <TableCell>{room.RoomNumber}</TableCell>
                  <TableCell>{ROOM_TYPE_MAP[room.RoomType]}</TableCell>
                  <TableCell>{room.Floor}层</TableCell>
                  <TableCell>{room.Building || '-'}</TableCell>
                  <TableCell>{room.BedCount || '-'}</TableCell>
                  <TableCell>{ROOM_STATUS_MAP[room.Status]}</TableCell>
                  <TableCell>{room.Description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleEdit(room)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleDelete(room.RoomID)}
                        isDisabled={room.Status === 'occupied'}
                      >
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <AddRoom
          isOpen={isAddOpen}
          onClose={onAddClose}
          onSuccess={loadRooms}
        />

        <EditRoom
          isOpen={isEditOpen}
          onClose={onEditClose}
          room={selectedRoom}
          onSuccess={loadRooms}
        />
      </div>
    </ProtectedRoute>
  )
} 