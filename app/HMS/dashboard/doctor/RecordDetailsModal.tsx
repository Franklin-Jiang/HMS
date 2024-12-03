'use client'

import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from "@nextui-org/react"
const { toast } = require('react-toastify');

interface RecordDetailsModalProps {
  recordId: number | null
  isOpen: boolean
  onClose: () => void
}

interface RecordDetails {
  RecordID: number
  PatientName: string
  PatientGender: 'M' | 'F'
  PatientDateOfBirth: string
  PatientPhone: string
  PatientAddress: string
  DoctorName: string
  DepartmentName: string
  Date: string
  Diagnosis: string
  Treatment: string
  Status: 'ongoing' | 'completed'
  CreatedAt: string
  UpdatedAt: string
  Medications: {
    TreatmentMedicationID: number
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

export default function RecordDetailsModal({ recordId, isOpen, onClose }: RecordDetailsModalProps) {
  const [record, setRecord] = React.useState<RecordDetails | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const loadRecordDetails = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/HMS/dashboard/doctor/records?id=${recordId}`)
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setRecord(data.record)
    } catch (error) {
      toast.error('加载记录详情失败')
    } finally {
      setIsLoading(false)
    }
  }, [recordId])

  React.useEffect(() => {
    if (recordId) {
      loadRecordDetails()
    }
  }, [recordId, loadRecordDetails])

  if (!record || isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalBody>
            <div className="py-8 text-center">加载中...</div>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <div>诊疗记录详情</div>
          <Chip
            color={record.Status === 'completed' ? 'success' : 'warning'}
            variant="flat"
          >
            {record.Status === 'completed' ? '已完成' : '进行中'}
          </Chip>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* 患者信息 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">患者信息</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">姓名</div>
                  <div>{record.PatientName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">性别</div>
                  <div>{record.PatientGender === 'M' ? '男' : '女'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">出生日期</div>
                  <div>{new Date(record.PatientDateOfBirth).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">联系电话</div>
                  <div>{record.PatientPhone}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-500">地址</div>
                  <div>{record.PatientAddress}</div>
                </div>
              </div>
            </div>

            {/* 诊疗信 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">诊疗信息</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">就诊时间</div>
                  <div>{new Date(record.Date).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">诊断结果</div>
                  <div className="whitespace-pre-wrap">{record.Diagnosis}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">治疗方案</div>
                  <div className="whitespace-pre-wrap">{record.Treatment}</div>
                </div>
              </div>
            </div>

            {/* 用药记录 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">用药记录</h3>
              <div className="space-y-4">
                {record.Medications.map((med, index) => (
                  <div key={med.TreatmentMedicationID} className="p-4 bg-gray-50 rounded">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">药品名称</div>
                        <div>{med.MedicineName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">规格</div>
                        <div>{med.Specification}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">单位</div>
                        <div>{med.Unit}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">剂量</div>
                        <div>{med.Dosage}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">频次</div>
                        <div>{med.Frequency}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">疗程</div>
                        <div>{med.Duration}</div>
                      </div>
                      {med.Notes && (
                        <div className="col-span-full">
                          <div className="text-sm text-gray-500">备注</div>
                          <div>{med.Notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 检查记录 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">检查记录</h3>
              <div className="space-y-4">
                {record.Examinations.map((exam) => (
                  <div key={exam.ExamID} className="p-4 bg-gray-50 rounded">
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-gray-500">检查类型</div>
                        <div>{exam.ExamType}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">检查结果</div>
                        <div>{exam.Result}</div>
                      </div>
                      {exam.Notes && (
                        <div>
                          <div className="text-sm text-gray-500">备注</div>
                          <div>{exam.Notes}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-gray-500">检查时间</div>
                        <div>{new Date(exam.Date).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 