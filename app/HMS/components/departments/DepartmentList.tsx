'use client'

import { useState, useEffect } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, useDisclosure } from "@nextui-org/react"
import { departmentAPI } from "../../services/api"
const { toast } = require('react-toastify')
import { Department } from "../../types"

export default function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    loadDepartments()
  }, [])

  async function loadDepartments() {
    try {
      const data = await departmentAPI.getList()
      setDepartments(data)
    } catch (error) {
      toast.error('加载科室列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await departmentAPI.delete(id, 'admin-token')
      toast.success('科室删除成功')
      loadDepartments()
    } catch (error) {
      toast.error('删除科室失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">科室列表</h3>
        <Button color="primary" onPress={onOpen}>
          添加科室
        </Button>
      </div>

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
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody 
          items={departments}
          isLoading={isLoading}
          loadingContent={<div>加载中...</div>}
          emptyContent={<div>暂无数据</div>}
        >
          {(department) => (
            <TableRow key={department.DepartmentID}>
              <TableCell>{department.DepartmentID}</TableCell>
              <TableCell>{department.Name}</TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  color="danger"
                  onPress={() => handleDelete(department.DepartmentID)}
                >
                  删除
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 