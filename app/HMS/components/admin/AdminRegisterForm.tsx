'use client'

import { Button, Input } from "@nextui-org/react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
const { toast } = require('react-toastify')

const ADMIN_CODE = 'HMS' // 管理员注册内部码

interface AdminRegisterFormData {
  Role: string
  Username: string
  Password: string
  ConfirmPassword: string
  AdminCode: string
}

export default function AdminRegisterForm() {
  const [formData, setFormData] = useState<AdminRegisterFormData>({
    Role: 'admin',
    Username: '',
    Password: '',
    ConfirmPassword: '',
    AdminCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.Password !== formData.ConfirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    if (formData.AdminCode !== ADMIN_CODE) {
      toast.error('内部码错误')
      return
    }

    try {
      setIsLoading(true)
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
        label="内部码"
        type="password"
        value={formData.AdminCode}
        onChange={(e) => setFormData(prev => ({ ...prev, AdminCode: e.target.value }))}
        isRequired
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