'use client'

import { Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useState } from "react"
import { authAPI } from "../../services/api"
const { toast } = require('react-toastify');

interface NurseFormData {
  Role: 'nurse'
  Username: string
  Password: string
  ConfirmPassword: string
  Name: string
  Gender: 'M' | 'F'
  Phone: string
  Shift: 'morning' | 'afternoon' | 'night'
}

export default function NurseRegisterForm() {
  const [formData, setFormData] = useState<NurseFormData>({
    Role: 'nurse',
    Username: '',
    Password: '',
    ConfirmPassword: '',
    Name: '',
    Gender: 'M',
    Phone: '',
    Shift: 'morning'
  })
  const [isLoading, setIsLoading] = useState(false)

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
      setIsLoading(true)
      await authAPI.register({
        ...formData,
        RelatedID: 0,
        Gender: formData.Gender,
        Shift: formData.Shift
      })
      toast.success('注册成功，等待管理员审核')
    } catch (error) {
      toast.error('注册失败')
    } finally {
      setIsLoading(false)
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
        onChange={(e) => setFormData(prev => ({ ...prev, Gender: e.target.value as 'M' | 'F' }))}
        isRequired
      >
        <SelectItem key="M" value="M">男</SelectItem>
        <SelectItem key="F" value="F">女</SelectItem>
      </Select>
      <Input
        label="联系电话"
        value={formData.Phone}
        onChange={(e) => setFormData(prev => ({ ...prev, Phone: e.target.value }))}
        isRequired
      />
      <Select
        label="班次"
        value={formData.Shift}
        onChange={(e) => setFormData(prev => ({ ...prev, Shift: e.target.value as 'morning' | 'afternoon' | 'night' }))}
        isRequired
      >
        <SelectItem key="morning" value="morning">早班</SelectItem>
        <SelectItem key="afternoon" value="afternoon">午班</SelectItem>
        <SelectItem key="night" value="night">晚班</SelectItem>
      </Select>
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