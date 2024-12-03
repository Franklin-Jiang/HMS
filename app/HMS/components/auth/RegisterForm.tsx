'use client'

import { Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useState } from "react"
import { authAPI } from "../../services/api"
const { toast } = require('react-toastify');
import { UserAccountFormData } from "../../types"

interface RegisterFormProps {
  onSuccess: () => void
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<UserAccountFormData>({
    Username: '',
    Password: '',
    Role: 'patient',
    RelatedID: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await authAPI.register(formData)
      toast.success('注册成功')
      onSuccess()
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
      <Select
        label="角色"
        selectedKeys={[formData.Role]}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          Role: e.target.value as 'patient' | 'doctor' | 'nurse' | 'admin'
        }))}
        isRequired
      >
        <SelectItem key="patient" value="patient">患者</SelectItem>
        <SelectItem key="doctor" value="doctor">医生</SelectItem>
        <SelectItem key="nurse" value="nurse">护士</SelectItem>
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