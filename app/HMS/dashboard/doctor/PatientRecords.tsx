'use client'

import React from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem } from "@nextui-org/react"
const { toast } = require('react-toastify')

interface Patient {
  PatientID: number
  Name: string
  Gender: 'M' | 'F'
  DateOfBirth: string
  Phone: string
  Address: string
}

interface Medicine {
  MedicineID: number
  Name: string
  Specification: string
  Unit: string
  Stock: number
}

interface TreatmentRecord {
  RecordID: number
  PatientID: number
  DoctorID: number
  Date: string
  Diagnosis: string
  Treatment: string
  Status: 'ongoing' | 'completed'
  Medications: {
    MedicineID: number
    Name: string
    Dosage: string
    Frequency: string
    Duration: string
  }[]
  Examinations: {
    ExamType: string
    Result: string
    Notes?: string
    Date: string
  }[]
}

export default function PatientRecords() {
  const [patients, setPatients] = React.useState<Patient[]>([])
  const [medicines, setMedicines] = React.useState<Medicine[]>([])
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    Diagnosis: '',
    Treatment: '',
    Medications: [{ MedicineID: '', Dosage: '', Frequency: '', Duration: '' }],
    Examinations: [{ ExamType: '', Result: '', Notes: '' }]
  })

  React.useEffect(() => {
    loadPatients()
    loadMedicines()
  }, [])

  async function loadPatients() {
    try {
      const response = await fetch('/api/HMS/dashboard/doctor/patients')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setPatients(data.patients)
    } catch (error) {
      toast.error('加载患者列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadMedicines() {
    try {
      const response = await fetch('/api/HMS/dashboard/doctor/medicines')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setMedicines(data.medicines)
    } catch (error) {
      toast.error('加载药品列表失败')
    }
  }

  const handleAddMedication = () => {
    setFormData(prev => ({
      ...prev,
      Medications: [...prev.Medications, { MedicineID: '', Dosage: '', Frequency: '', Duration: '' }]
    }))
  }

  const handleAddExamination = () => {
    setFormData(prev => ({
      ...prev,
      Examinations: [...prev.Examinations, { ExamType: '', Result: '', Notes: '' }]
    }))
  }

  const handleSubmit = async () => {
    if (!selectedPatient) return

    try {
      const response = await fetch('/api/HMS/dashboard/doctor/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          PatientID: selectedPatient.PatientID,
          ...formData
        })
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('诊疗记录添加成功')
      setIsModalOpen(false)
      // 重置表单
      setFormData({
        Diagnosis: '',
        Treatment: '',
        Medications: [{ MedicineID: '', Dosage: '', Frequency: '', Duration: '' }],
        Examinations: [{ ExamType: '', Result: '', Notes: '' }]
      })
    } catch (error) {
      toast.error('添加诊疗记录失败')
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableColumn>姓名</TableColumn>
          <TableColumn>性别</TableColumn>
          <TableColumn>年龄</TableColumn>
          <TableColumn>联系电话</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody
          items={patients}
          emptyContent={isLoading ? "加载中..." : "暂无患者"}
        >
          {(patient: Patient) => (
            <TableRow key={patient.PatientID}>
              <TableCell>{patient.Name}</TableCell>
              <TableCell>{patient.Gender === 'M' ? '男' : '女'}</TableCell>
              <TableCell>
                {new Date().getFullYear() - new Date(patient.DateOfBirth).getFullYear()}岁
              </TableCell>
              <TableCell>{patient.Phone}</TableCell>
              <TableCell>
                <Button
                  color="primary"
                  size="sm"
                  onPress={() => {
                    setSelectedPatient(patient)
                    setIsModalOpen(true)
                  }}
                >
                  添加诊疗记录
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            添加诊疗记录 - {selectedPatient?.Name}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Textarea
                label="诊断结果"
                value={formData.Diagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, Diagnosis: e.target.value }))}
                minRows={2}
              />
              <Textarea
                label="治疗方案"
                value={formData.Treatment}
                onChange={(e) => setFormData(prev => ({ ...prev, Treatment: e.target.value }))}
                minRows={2}
              />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">用药记录</h3>
                  <Button
                    color="primary"
                    size="sm"
                    variant="flat"
                    onPress={handleAddMedication}
                  >
                    添加药品
                  </Button>
                </div>
                {formData.Medications.map((med, index) => (
                  <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <Select
                      label="药品"
                      value={med.MedicineID}
                      onChange={(e) => {
                        const newMeds = [...formData.Medications]
                        newMeds[index].MedicineID = e.target.value
                        setFormData(prev => ({ ...prev, Medications: newMeds }))
                      }}
                    >
                      {medicines.map(m => (
                        <SelectItem key={m.MedicineID} value={m.MedicineID.toString()}>
                          {m.Name} ({m.Specification})
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      label="剂量"
                      value={med.Dosage}
                      onChange={(e) => {
                        const newMeds = [...formData.Medications]
                        newMeds[index].Dosage = e.target.value
                        setFormData(prev => ({ ...prev, Medications: newMeds }))
                      }}
                    />
                    <Input
                      label="频次"
                      value={med.Frequency}
                      onChange={(e) => {
                        const newMeds = [...formData.Medications]
                        newMeds[index].Frequency = e.target.value
                        setFormData(prev => ({ ...prev, Medications: newMeds }))
                      }}
                    />
                    <Input
                      label="疗程"
                      value={med.Duration}
                      onChange={(e) => {
                        const newMeds = [...formData.Medications]
                        newMeds[index].Duration = e.target.value
                        setFormData(prev => ({ ...prev, Medications: newMeds }))
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">检查记录</h3>
                  <Button
                    color="primary"
                    size="sm"
                    variant="flat"
                    onPress={handleAddExamination}
                  >
                    添加检查
                  </Button>
                </div>
                {formData.Examinations.map((exam, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="检查类型"
                      value={exam.ExamType}
                      onChange={(e) => {
                        const newExams = [...formData.Examinations]
                        newExams[index].ExamType = e.target.value
                        setFormData(prev => ({ ...prev, Examinations: newExams }))
                      }}
                    />
                    <Input
                      label="检查结果"
                      value={exam.Result}
                      onChange={(e) => {
                        const newExams = [...formData.Examinations]
                        newExams[index].Result = e.target.value
                        setFormData(prev => ({ ...prev, Examinations: newExams }))
                      }}
                    />
                    <Textarea
                      label="备注"
                      value={exam.Notes}
                      onChange={(e) => {
                        const newExams = [...formData.Examinations]
                        newExams[index].Notes = e.target.value
                        setFormData(prev => ({ ...prev, Examinations: newExams }))
                      }}
                      className="md:col-span-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 