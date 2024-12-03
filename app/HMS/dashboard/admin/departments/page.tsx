'use client'

import { useState, useEffect } from 'react'
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, useDisclosure } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../../components/auth/ProtectedRoute"
import AddDepartmentModal from "./AddDepartmentModal"
import EditDepartmentModal from "./EditDepartmentModal"
const { toast } = require('react-toastify')

interface Department {
  DepartmentID: number
  Name: string
  Description: string
  Location: string
}

function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
  const router = useRouter()

  useEffect(() => {
    loadDepartments()
  }, [])

  async function loadDepartments() {
    try {
      const response = await fetch('/api/HMS/dashboard/admin/departments')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setDepartments(data.departments)
    } catch (error) {
      toast.error('加载科室列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department)
    onEditOpen()
  }

  const handleDelete = async (departmentId: number) => {
    if (!confirm('确定要删除这个科室吗？')) return

    try {
      const response = await fetch(`/api/HMS/dashboard/admin/departments?id=${departmentId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('科室删除成功')
      loadDepartments()
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
            <h1 className="text-2xl font-bold">科室管理</h1>
          </div>
          <Button
            color="primary"
            onPress={onAddOpen}
          >
            添加科室
          </Button>
        </div>

        <Card>
          <Table
            aria-label="科室列表"
            isStriped
            isHeaderSticky
            classNames={{
              wrapper: "max-h-[600px]"
            }}
          >
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>名称</TableColumn>
              <TableColumn>描述</TableColumn>
              <TableColumn>位置</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody
              items={departments}
              isLoading={isLoading}
              loadingContent={<div>加载中...</div>}
              emptyContent={<div>暂无科室</div>}
            >
              {(department) => (
                <TableRow key={department.DepartmentID}>
                  <TableCell>{department.DepartmentID}</TableCell>
                  <TableCell>{department.Name}</TableCell>
                  <TableCell>{department.Description}</TableCell>
                  <TableCell>{department.Location}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        color="primary"
                        size="sm"
                        variant="flat"
                        onPress={() => handleEdit(department)}
                      >
                        编辑
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        variant="flat"
                        onPress={() => handleDelete(department.DepartmentID)}
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

        <AddDepartmentModal
          isOpen={isAddOpen}
          onClose={onAddClose}
          onSuccess={() => {
            onAddClose()
            loadDepartments()
          }}
        />

        <EditDepartmentModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          department={selectedDepartment}
          onSuccess={() => {
            onEditClose()
            loadDepartments()
          }}
        />
      </div>
    </ProtectedRoute>
  )
}

export default DepartmentsPage 