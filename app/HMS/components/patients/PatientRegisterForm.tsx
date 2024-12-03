'use client'

import { Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
const { toast } = require('react-toastify')

interface PatientRegisterFormProps {
  onSuccess: () => void
}

interface PatientRegisterFormData {
  Role: 'patient'
  Username: string
  Password: string
  ConfirmPassword: string
  Name: string
  Gender: 'M' | 'F'
  DateOfBirth: string
  Phone: string
  Address: string
}

export default function PatientRegisterForm() {
  const [formData, setFormData] = useState<PatientRegisterFormData>({
    Role: 'patient',
    Username: '',
    Password: '',
    ConfirmPassword: '',
    Name: '',
    Gender: 'M',
    DateOfBirth: '',
    Phone: '',
    Address: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.Password !== formData.ConfirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    if (formData.Name.length < 2) {
      toast.error('姓名至少需要2个字符')
      return
    }

    try {
      const response = await fetch('/api/HMS/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          Role: formData.Role.toLowerCase()
        })
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success(data.message)
      router.push('/HMS/login')
    } catch (error) {
      toast.error('注册失败，请稍后重试')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="用户名"
        value={formData.Username}
        onChange={(e) => setFormData(prev => ({ ...prev, Username: e.target.value }))}
        isRequired
      />
      <Input
        label="密码"
        type="password"
        value={formData.Password}
        onChange={(e) => setFormData(prev => ({ ...prev, Password: e.target.value }))}
        isRequired
      />
      <Input
        label="确认密码"
        type="password"
        value={formData.ConfirmPassword}
        onChange={(e) => setFormData(prev => ({ ...prev, ConfirmPassword: e.target.value }))}
        isRequired
      />
      <Input
        label="姓名"
        value={formData.Name}
        onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
        isRequired
        pattern="^[\u4e00-\u9fa5a-zA-Z0-9\s·.。-]+$"
      />
      <Select
        label="性别"
        value={formData.Gender}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          Gender: e.target.value as 'M' | 'F'
        }))}
        isRequired
      >
        <SelectItem key="M" value="M">男</SelectItem>
        <SelectItem key="F" value="F">女</SelectItem>
      </Select>
      <Input
        label="出生日期"
        type="date"
        value={formData.DateOfBirth}
        onChange={(e) => setFormData(prev => ({ ...prev, DateOfBirth: e.target.value }))}
        isRequired
      />
      <Input
        label="联系电话"
        value={formData.Phone}
        onChange={(e) => setFormData(prev => ({ ...prev, Phone: e.target.value }))}
        isRequired
      />
      <Input
        label="地址"
        value={formData.Address}
        onChange={(e) => setFormData(prev => ({ ...prev, Address: e.target.value }))}
      />
      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        fullWidth
      >
        注册
      </Button>
    </form>
  )
} 