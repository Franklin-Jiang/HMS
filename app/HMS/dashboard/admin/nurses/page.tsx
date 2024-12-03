'use client'

import React from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Card, useDisclosure } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../../components/auth/ProtectedRoute"
import { Nurse } from "../../../types"
import AssignRoomsModal from "./AssignRoomsModal"
const { toast } = require('react-toastify')

export default function NursesPage() {
  const [nurses, setNurses] = React.useState<Nurse[]>([])
  const [selectedNurse, setSelectedNurse] = React.useState<Nurse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  const {
    isOpen: isAssignOpen,
    onOpen: onAssignOpen,
    onClose: onAssignClose
  } = useDisclosure()

  React.useEffect(() => {
    loadNurses()
  }, [])

  async function loadNurses() {
    try {
      const response = await fetch('/api/HMS/dashboard/admin/nurses')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setNurses(data.nurses)
    } catch (error) {
      toast.error('加载护士列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignRooms = (nurse: Nurse) => {
    setSelectedNurse(nurse)
    onAssignOpen()
  }

  const handleDelete = async (nurseId: number) => {
    if (!confirm('确定要删除这个护士吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/HMS/dashboard/admin/nurses?id=${nurseId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(data.message)
      loadNurses()
    } catch (error) {
      toast.error('删除护士失败')
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
            <h1 className="text-2xl font-bold">护士管理</h1>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>姓名</TableColumn>
              <TableColumn>性别</TableColumn>
              <TableColumn>联系电话</TableColumn>
              <TableColumn>班次</TableColumn>
              <TableColumn>分配房间</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody>
              {nurses.map(nurse => (
                <TableRow key={nurse.NurseID}>
                  <TableCell>{nurse.NurseID}</TableCell>
                  <TableCell>{nurse.Name}</TableCell>
                  <TableCell>{nurse.Gender === 'M' ? '男' : '女'}</TableCell>
                  <TableCell>{nurse.Phone}</TableCell>
                  <TableCell>
                    {nurse.Shift === 'morning' ? '早班' :
                      nurse.Shift === 'afternoon' ? '午班' : '晚班'}
                  </TableCell>
                  <TableCell>
                    {nurse.AssignedRooms && nurse.AssignedRooms.length > 0
                      ? nurse.AssignedRooms
                        .filter(room => room && room.RoomNumber)
                        .map(room => room.RoomNumber)
                        .join(', ')
                      : '未分配'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => handleAssignRooms(nurse)}
                      >
                        分配房间
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => router.push(`/HMS/dashboard/admin/nurses/edit?id=${nurse.NurseID}`)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleDelete(nurse.NurseID)}
                      >
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <AssignRoomsModal
          isOpen={isAssignOpen}
          onClose={onAssignClose}
          nurse={selectedNurse}
          onSuccess={() => {
            loadNurses()
            onAssignClose()
          }}
        />
      </div>
    </ProtectedRoute>
  )
} 