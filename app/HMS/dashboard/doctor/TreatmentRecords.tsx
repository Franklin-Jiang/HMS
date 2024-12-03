'use client'

import React from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Chip } from "@nextui-org/react"
import RecordDetailsModal from './RecordDetailsModal'
import PageTitle from '../../components/PageTitle'
const { toast } = require('react-toastify')

interface TreatmentRecord {
  RecordID: number
  PatientID: number
  DoctorID: number
  Date: string
  Diagnosis: string
  Treatment: string
  Status: 'ongoing' | 'completed'
  CreatedAt: string
  UpdatedAt: string
  PatientName: string
  PatientGender: 'M' | 'F'
  PatientDateOfBirth: string
  PatientPhone: string
  Medications: {
    TreatmentMedicationID: number
    MedicineID: number
    MedicineName: string
    Specification: string
    Unit: string
    Dosage: string
    Frequency: string
    Duration: string
    Notes?: string
  }[]
  Examinations: {
    ExamID: number
    ExamType: string
    Result: string
    Notes?: string
    Date: string
  }[]
}

interface Patient {
  PatientID: number
  Name: string
  Gender: 'M' | 'F'
  DateOfBirth: string
  Phone: string
}

interface Medicine {
  MedicineID: number
  Name: string
  Specification: string
  Unit: string
  Stock: number
}

interface FormData {
  Diagnosis: string
  Treatment: string
  Medications: Array<{
    MedicineID: string
    Dosage: string
    Frequency: string
    Duration: string
  }>
  Examinations: Array<{
    ExamType: string
    Result: string
    Notes: string
  }>
}

export default function TreatmentRecords() {
  const [records, setRecords] = React.useState<TreatmentRecord[]>([])
  const [patients, setPatients] = React.useState<Patient[]>([])
  const [medicines, setMedicines] = React.useState<Medicine[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null)
  const [formData, setFormData] = React.useState({
    Diagnosis: '',
    Treatment: '',
    Medications: [{ MedicineID: '', Dosage: '', Frequency: '', Duration: '' }],
    Examinations: [{ ExamType: '', Result: '', Notes: '' }]
  })
  const [selectedRecordId, setSelectedRecordId] = React.useState<number | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filteredPatients, setFilteredPatients] = React.useState<Patient[]>([])
  const [isEditing, setIsEditing] = React.useState(false)
  const [editingRecord, setEditingRecord] = React.useState<TreatmentRecord | null>(null)
  const [recordSearchQuery, setRecordSearchQuery] = React.useState('')
  const [filteredRecords, setFilteredRecords] = React.useState<TreatmentRecord[]>([])

  React.useEffect(() => {
    loadRecords()
    loadPatients()
    loadMedicines()
  }, [])

  React.useEffect(() => {
    setFilteredPatients(patients)
  }, [patients])

  async function loadRecords() {
    try {
      const response = await fetch('/api/HMS/dashboard/doctor/records')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setRecords(data.records)
      setFilteredRecords(data.records)
    } catch (error) {
      toast.error('加载诊疗记录失败')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSubmit = async () => {
    if (!selectedPatient) return

    const validMedications = formData.Medications.filter(med =>
      med.MedicineID && med.Dosage && med.Frequency && med.Duration
    ).map(med => ({
      ...med,
      MedicineID: parseInt(med.MedicineID)
    }))

    const validExaminations = formData.Examinations.filter(exam =>
      exam.ExamType && exam.Result
    )

    try {
      const response = await fetch('/api/HMS/dashboard/doctor/records' + (isEditing ? `/${editingRecord?.RecordID}` : ''), {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          PatientID: selectedPatient.PatientID,
          Diagnosis: formData.Diagnosis,
          Treatment: formData.Treatment,
          Medications: validMedications,
          Examinations: validExaminations
        })
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success(isEditing ? '诊疗记录更新成功' : '诊疗记录添加成功')
      setIsModalOpen(false)
      setIsEditing(false)
      setEditingRecord(null)
      loadRecords()
      // 重置表单
      setFormData({
        Diagnosis: '',
        Treatment: '',
        Medications: [{ MedicineID: '', Dosage: '', Frequency: '', Duration: '' }],
        Examinations: [{ ExamType: '', Result: '', Notes: '' }]
      })
    } catch (error) {
      toast.error(isEditing ? '更新诊疗记录失败' : '添加诊疗记录失败')
    }
  }

  const handleComplete = async (recordId: number) => {
    if (!confirm('确定要将此诊疗记录标记为已完成吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/HMS/dashboard/doctor/records/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'complete' })
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('诊疗记录已完成')
      loadRecords()
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const handleSearch = React.useCallback((value: string) => {
    setSearchQuery(value)
    if (!value.trim()) {
      setFilteredPatients(patients)
      return
    }

    const searchValue = value.toLowerCase()
    const filtered = patients.filter(patient => {
      const patientInfo = `
        ${patient.Name}
        ${patient.Gender === 'M' ? '男' : '女'}
        ${calculateAge(patient.DateOfBirth)}岁
        ${patient.Phone}
      `.toLowerCase()
      return patientInfo.includes(searchValue)
    })

    setFilteredPatients(filtered)
  }, [patients])

  const handleEdit = (record: TreatmentRecord) => {
    setEditingRecord(record)
    setSelectedPatient({
      PatientID: record.PatientID,
      Name: record.PatientName,
      Gender: record.PatientGender,
      DateOfBirth: record.PatientDateOfBirth,
      Phone: record.PatientPhone
    })
    setFormData({
      Diagnosis: record.Diagnosis,
      Treatment: record.Treatment,
      Medications: record.Medications.length > 0 ? record.Medications.map(med => ({
        MedicineID: med.MedicineID.toString(),
        Dosage: med.Dosage,
        Frequency: med.Frequency,
        Duration: med.Duration
      })) : [{ MedicineID: '', Dosage: '', Frequency: '', Duration: '' }],
      Examinations: record.Examinations.length > 0 ? record.Examinations.map(exam => ({
        ExamType: exam.ExamType,
        Result: exam.Result,
        Notes: exam.Notes || ''
      })) : [{ ExamType: '', Result: '', Notes: '' }]
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // 添加计算年龄的辅助函数
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // 添加记录搜索处理函数
  const handleRecordSearch = (value: string) => {
    setRecordSearchQuery(value)
    if (!value.trim()) {
      setFilteredRecords(records)
      return
    }

    const searchValue = value.toLowerCase()
    const filtered = records.filter(record => {
      // 搜索患者信息
      const patientInfo = `
        ${record.PatientName}
        ${record.PatientGender === 'M' ? '男' : '女'}
        ${calculateAge(record.PatientDateOfBirth)}岁
        ${record.PatientPhone}
      `.toLowerCase()

      // 搜索诊疗记录信息
      const recordInfo = `
        ${record.Diagnosis}
        ${record.Treatment}
        ${record.Status === 'ongoing' ? '进行中' : '已完成'}
        ${new Date(record.Date).toLocaleString()}
      `.toLowerCase()

      // 搜索用药信息
      const medicationInfo = record.Medications.map(med => `
        ${med.MedicineName}
        ${med.Specification}
        ${med.Dosage}
        ${med.Frequency}
        ${med.Duration}
        ${med.Notes || ''}
      `).join(' ').toLowerCase()

      // 搜索检查信息
      const examinationInfo = record.Examinations.map(exam => `
        ${exam.ExamType}
        ${exam.Result}
        ${exam.Notes || ''}
      `).join(' ').toLowerCase()

      // 合并所有信息进行搜索
      const allInfo = `
        ${patientInfo}
        ${recordInfo}
        ${medicationInfo}
        ${examinationInfo}
      `

      return allInfo.includes(searchValue)
    })

    setFilteredRecords(filtered)
  }

  // 添加删除处理函数
  const handleDelete = async (recordId: number) => {
    if (!confirm('确定要删除这条诊疗记录吗？此操作不可恢复。')) {
      return
    }

    try {
      const response = await fetch(`/api/HMS/dashboard/doctor/records/${recordId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('诊疗记录已删除')
      loadRecords()
    } catch (error) {
      toast.error('删除记录失败')
    }
  }

  return (
    <PageTitle title="诊疗记录">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 max-w-md">
            <Input
              label="搜索诊疗记录"
              placeholder="输入任意信息搜索..."
              value={recordSearchQuery}
              onChange={(e) => handleRecordSearch(e.target.value)}
              isClearable
            />
          </div>
          <Button
            color="primary"
            onPress={() => setIsModalOpen(true)}
          >
            新建诊疗记录
          </Button>
        </div>

        <Table
          aria-label="诊疗记录列表"
          isStriped
          isHeaderSticky
          classNames={{
            wrapper: "max-h-[600px]"
          }}
        >
          <TableHeader>
            <TableColumn>就诊时间</TableColumn>
            <TableColumn>患者信息</TableColumn>
            <TableColumn>诊断结果</TableColumn>
            <TableColumn>治疗方案</TableColumn>
            <TableColumn>用药记录</TableColumn>
            <TableColumn>检查记录</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody
            items={filteredRecords}
            isLoading={isLoading}
            loadingContent={<div>加载中...</div>}
            emptyContent={<div>暂无诊疗记录</div>}
          >
            {(record) => (
              <TableRow key={record.RecordID}>
                <TableCell>{new Date(record.Date).toLocaleString()}</TableCell>
                <TableCell>
                  <div>
                    <div>{record.PatientName}</div>
                    <div className="text-sm text-gray-500">
                      {record.PatientGender === 'M' ? '男' : '女'} / {calculateAge(record.PatientDateOfBirth)}岁
                    </div>
                    <div className="text-sm text-gray-500">{record.PatientPhone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="whitespace-pre-wrap">{record.Diagnosis}</div>
                </TableCell>
                <TableCell>
                  <div className="whitespace-pre-wrap">{record.Treatment}</div>
                </TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {record.Medications.map((med, index) => (
                      <li key={index}>
                        {med.MedicineName} - {med.Dosage}
                        <br />
                        <small className="text-gray-500">
                          {med.Frequency}, {med.Duration}
                        </small>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  {record.Examinations.map((exam, index) => (
                    <div key={index} className="mb-2">
                      <div className="font-medium">{exam.ExamType}</div>
                      <div>结果：{exam.Result}</div>
                      {exam.Notes && <div>备注：{exam.Notes}</div>}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <Chip
                    color={record.Status === 'ongoing' ? 'warning' : 'success'}
                    variant="flat"
                  >
                    {record.Status === 'ongoing' ? '进行中' : '完成'}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {record.Status === 'ongoing' ? (
                      <>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleEdit(record)}
                        >
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          onPress={() => handleComplete(record.RecordID)}
                        >
                          完成
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleDelete(record.RecordID)}
                        >
                          删除
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => setSelectedRecordId(record.RecordID)}
                      >
                        详情
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* 新建诊疗记录的模态框 */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setIsEditing(false)
            setEditingRecord(null)
            setFormData({
              Diagnosis: '',
              Treatment: '',
              Medications: [{ MedicineID: '', Dosage: '', Frequency: '', Duration: '' }],
              Examinations: [{ ExamType: '', Result: '', Notes: '' }]
            })
          }}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              {isEditing ? '编辑诊疗记录' : '新建诊疗记录'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* 患者选择部分 - 编辑时禁用 */}
                <div className="space-y-2">
                  {!isEditing && (
                    <>
                      <Input
                        label="搜索患者"
                        placeholder="输入姓名或手机号"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        isClearable
                      />
                      <Select
                        label="选择患者"
                        onChange={(e) => {
                          const patient = patients.find(p => p.PatientID.toString() === e.target.value)
                          setSelectedPatient(patient || null)
                        }}
                      >
                        {filteredPatients.map(patient => (
                          <SelectItem key={patient.PatientID} value={patient.PatientID.toString()}>
                            {patient.Name} ({patient.Gender === 'M' ? '男' : '女'}) - {calculateAge(patient.DateOfBirth)}岁 - {patient.Phone}
                          </SelectItem>
                        ))}
                      </Select>
                    </>
                  )}

                  {selectedPatient && (
                    <div className="p-4 bg-gray-50 rounded">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">姓名</div>
                          <div>{selectedPatient.Name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">性别/年龄</div>
                          <div>
                            {selectedPatient.Gender === 'M' ? '男' : '女'} / {calculateAge(selectedPatient.DateOfBirth)}岁
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">出生日期</div>
                          <div>{new Date(selectedPatient.DateOfBirth).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">联系电话</div>
                          <div>{selectedPatient.Phone}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 诊断和治疗方案 */}
                <Textarea
                  label="诊断结果"
                  placeholder="请输入诊断结果"
                  value={formData.Diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, Diagnosis: e.target.value }))}
                  minRows={3}
                  isRequired
                />
                <Textarea
                  label="治疗方案"
                  placeholder="请输入治疗方案"
                  value={formData.Treatment}
                  onChange={(e) => setFormData(prev => ({ ...prev, Treatment: e.target.value }))}
                  minRows={3}
                  isRequired
                />

                {/* 用药记录 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">用药记录</h3>
                    <Button
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() => setFormData(prev => ({
                        ...prev,
                        Medications: [...prev.Medications, { MedicineID: '', Dosage: '', Frequency: '', Duration: '' }]
                      }))}
                    >
                      添加用药
                    </Button>
                  </div>
                  {formData.Medications.map((med, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          label="药品"
                          selectedKeys={med.MedicineID ? [med.MedicineID] : []}
                          onChange={(e) => {
                            const newMeds = [...formData.Medications]
                            newMeds[index].MedicineID = e.target.value
                            setFormData(prev => ({ ...prev, Medications: newMeds }))
                          }}
                          isRequired
                        >
                          {[
                            { id: '', name: '请选择药品' },
                            ...medicines.map(medicine => ({
                              id: medicine.MedicineID.toString(),
                              name: `${medicine.Name} (${medicine.Specification}) - 库存: ${medicine.Stock}${medicine.Unit}`
                            }))
                          ].map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </Select>
                        <Input
                          label="用药剂量"
                          placeholder="如：每次2片"
                          value={med.Dosage}
                          onChange={(e) => {
                            const newMeds = [...formData.Medications]
                            newMeds[index].Dosage = e.target.value
                            setFormData(prev => ({ ...prev, Medications: newMeds }))
                          }}
                          isRequired
                        />
                        <Input
                          label="用药频次"
                          placeholder="如：每日3次"
                          value={med.Frequency}
                          onChange={(e) => {
                            const newMeds = [...formData.Medications]
                            newMeds[index].Frequency = e.target.value
                            setFormData(prev => ({ ...prev, Medications: newMeds }))
                          }}
                          isRequired
                        />
                        <Input
                          label="用药疗程"
                          placeholder="如：7天"
                          value={med.Duration}
                          onChange={(e) => {
                            const newMeds = [...formData.Medications]
                            newMeds[index].Duration = e.target.value
                            setFormData(prev => ({ ...prev, Medications: newMeds }))
                          }}
                          isRequired
                        />
                      </div>
                      <Button
                        color="danger"
                        size="sm"
                        variant="light"
                        className="mt-2"
                        onPress={() => {
                          const newMeds = formData.Medications.filter((_, i) => i !== index)
                          setFormData(prev => ({ ...prev, Medications: newMeds }))
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>

                {/* 检查记录 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">检查记录</h3>
                    <Button
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() => setFormData(prev => ({
                        ...prev,
                        Examinations: [...prev.Examinations, { ExamType: '', Result: '', Notes: '' }]
                      }))}
                    >
                      添加检查
                    </Button>
                  </div>
                  {formData.Examinations.map((exam, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded mb-4">
                      <div className="grid grid-cols-1 gap-4">
                        <Input
                          label="检查类型"
                          value={exam.ExamType}
                          onChange={(e) => {
                            const newExams = [...formData.Examinations]
                            newExams[index].ExamType = e.target.value
                            setFormData(prev => ({ ...prev, Examinations: newExams }))
                          }}
                          isRequired
                        />
                        <Textarea
                          label="检查结果"
                          value={exam.Result}
                          onChange={(e) => {
                            const newExams = [...formData.Examinations]
                            newExams[index].Result = e.target.value
                            setFormData(prev => ({ ...prev, Examinations: newExams }))
                          }}
                          isRequired
                        />
                        <Textarea
                          label="备注"
                          value={exam.Notes}
                          onChange={(e) => {
                            const newExams = [...formData.Examinations]
                            newExams[index].Notes = e.target.value
                            setFormData(prev => ({ ...prev, Examinations: newExams }))
                          }}
                        />
                      </div>
                      <Button
                        color="danger"
                        size="sm"
                        variant="light"
                        className="mt-2"
                        onPress={() => {
                          const newExams = formData.Examinations.filter((_, i) => i !== index)
                          setFormData(prev => ({ ...prev, Examinations: newExams }))
                        }}
                      >
                        删除
                      </Button>
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

        {/* 添加详情 Modal */}
        <RecordDetailsModal
          recordId={selectedRecordId}
          isOpen={selectedRecordId !== null}
          onClose={() => setSelectedRecordId(null)}
        />
      </div>
    </PageTitle>
  )
} 