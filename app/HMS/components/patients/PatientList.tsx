'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, useDisclosure } from "@nextui-org/react"
import { useState, useEffect } from "react"
import { Patient } from "../../types"
import { getPatients, deletePatient } from "../../services/patientService"
import AddPatientModal from "./AddPatientModal"
import EditPatientModal from "./EditPatientModal"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DeleteConfirmModal from "./DeleteConfirmModal"

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    try {
      setIsLoading(true)
      const data = await getPatients()
      setPatients(data)
    } catch (error) {
      toast.error('加载患者列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    onEditOpen()
  }

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient)
    onDeleteOpen()
  }

  async function handleDeleteConfirm() {
    if (!patientToDelete) return

    try {
      setIsDeleting(true)
      await deletePatient(patientToDelete.PatientID, 'admin-token')
      toast.success('患者删除成功')
      await loadPatients()
      onDeleteClose()
    } catch (error) {
      toast.error('删除患者失败')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <ToastContainer position="top-right" />
      
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">患者列表</h3>
        <Button 
          color="primary" 
          onPress={onAddOpen}
          isDisabled={isLoading}
        >
          添加患者
        </Button>
      </div>

      <AddPatientModal 
        isOpen={isAddOpen} 
        onClose={onAddClose}
        onSuccess={() => {
          loadPatients()
          toast.success('患者添加成功')
        }}
      />

      <EditPatientModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        onSuccess={() => {
          loadPatients()
          toast.success('患者信息更新成功')
        }}
        patient={selectedPatient}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDeleteConfirm}
        patientName={patientToDelete?.Name || ''}
        isLoading={isDeleting}
      />

      <Table 
        aria-label="患者列表"
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
          <TableColumn>出生日期</TableColumn>
          <TableColumn>电话</TableColumn>
          <TableColumn>地址</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody 
          items={patients}
          isLoading={isLoading}
          loadingContent={<div>加载中...</div>}
          emptyContent={<div>暂无数据</div>}
        >
          {(patient) => (
            <TableRow key={patient.PatientID}>
              <TableCell>{patient.PatientID}</TableCell>
              <TableCell>{patient.Name}</TableCell>
              <TableCell>{patient.Gender === 'M' ? '男' : '女'}</TableCell>
              <TableCell>{patient.DateOfBirth}</TableCell>
              <TableCell>{patient.Phone}</TableCell>
              <TableCell>{patient.Address}</TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  color="primary" 
                  className="mr-2"
                  onPress={() => handleEdit(patient)}
                >
                  编辑
                </Button>
                <Button 
                  size="sm" 
                  color="danger"
                  onPress={() => handleDeleteClick(patient)}
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