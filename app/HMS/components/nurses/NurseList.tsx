'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, useDisclosure } from "@nextui-org/react"
import { useState, useEffect } from "react"
import { Nurse } from "../../types"
import { nurseAPI } from "../../services/api"
const { toast } = require('react-toastify');
import AddNurseModal from "./AddNurseModal"

export default function NurseList() {
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUserProfile()
    loadNurses()
  }, [])

  async function loadUserProfile() {
    try {
      const response = await fetch('/api/HMS/session')
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      toast.error('加载用户信息失败')
    }
  }

  async function loadNurses() {
    try {
      const data = await nurseAPI.getList()
      setNurses(data)
    } catch (error) {
      toast.error('加载护士列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/HMS?type=nurse&id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('护士删除成功')
      loadNurses()
    } catch (error) {
      toast.error('删除护士失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">护士列表</h3>
        {user?.Role === 'admin' && (
          <Button color="primary" onPress={onOpen}>
            添加护士
          </Button>
        )}
      </div>

      <AddNurseModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={loadNurses}
      />

      <Table
        aria-label="护士列表"
        isStriped
        isHeaderSticky
        classNames={{
          wrapper: "max-h-[600px]"
        }}
      >
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>姓名</TableColumn>
          <TableColumn>性别</TableColumn>
          <TableColumn>联系电话</TableColumn>
          <TableColumn>房间</TableColumn>
          <TableColumn>班次</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody
          items={nurses}
          isLoading={isLoading}
          loadingContent={<div>加载中...</div>}
          emptyContent={<div>暂无数据</div>}
        >
          {(nurse) => (
            <TableRow key={nurse.NurseID}>
              <TableCell>{nurse.NurseID}</TableCell>
              <TableCell>{nurse.Name}</TableCell>
              <TableCell>{nurse.Gender === 'M' ? '男' : '女'}</TableCell>
              <TableCell>{nurse.Phone}</TableCell>
              <TableCell>
                {nurse.AssignedRooms?.map(room => room.RoomNumber).join(', ') || '未分配'}
              </TableCell>
              <TableCell>
                {nurse.Shift === 'morning' ? '早班' :
                  nurse.Shift === 'afternoon' ? '午班' : '晚班'}
              </TableCell>
              <TableCell className="flex gap-2">
                {user?.Role === 'admin' && (
                  <Button
                    size="sm"
                    color="danger"
                    onPress={() => handleDelete(nurse.NurseID)}
                  >
                    删除
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 