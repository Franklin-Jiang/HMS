'use client'

import { Button, Input } from "@nextui-org/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
const { toast } = require('react-toastify')

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await fetch('/api/HMS/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('登录成功')

      // 根据用户角色跳转到不同页面
      switch (data.user.Role) {
        case 'admin':
          router.push('/HMS/dashboard/admin')
          break
        case 'doctor':
          router.push('/HMS/dashboard/doctor')
          break
        case 'nurse':
          router.push('/HMS/dashboard/nurse')
          break
        case 'patient':
          router.push('/HMS/dashboard/patient')
          break
        default:
          router.push('/HMS')
      }
    } catch (error) {
      toast.error('登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="用户名"
        value={formData.username}
        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
        isRequired
      />
      <Input
        label="密码"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        isRequired
      />
      <Button 
        type="submit" 
        color="primary" 
        isLoading={isLoading}
        fullWidth
      >
        登录
      </Button>
    </form>
  )
} 