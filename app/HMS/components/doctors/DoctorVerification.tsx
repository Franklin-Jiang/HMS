'use client'

import { Button, Card, CardBody, CardHeader } from "@nextui-org/react"
import { useState } from "react"
import { authAPI } from "../../services/api"
const { toast } = require('react-toastify');
import { Doctor } from "../../types"

interface DoctorVerificationProps {
  doctor: Doctor
  onVerified: () => void
  isOpen: boolean
  onClose: () => void
}

export default function DoctorVerification({ doctor, onVerified, isOpen, onClose }: DoctorVerificationProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async () => {
    try {
      setIsLoading(true)
      await authAPI.verifyDoctor(doctor.DoctorID)
      toast.success('医生验证成功')
      onVerified()
    } catch (error) {
      toast.error('医生验证失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>医生验证</CardHeader>
      <CardBody>
        <div className="space-y-2">
          <p>姓名：{doctor.Name}</p>
          <p>性别：{doctor.Gender === 'M' ? '男' : '女'}</p>
          <p>联系电话：{doctor.Phone}</p>
          <Button
            color="primary"
            onPress={handleVerify}
            isLoading={isLoading}
          >
            验证医生资格
          </Button>
        </div>
      </CardBody>
    </Card>
  )
} 