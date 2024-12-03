'use client'

import { Card, CardBody, CardHeader, Button, Input } from "@nextui-org/react"
import { useState, useEffect } from "react"
const { toast } = require('react-toastify');
import { userAPI } from "../../services/userService"

export default function ChangePassword() {
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    try {
      const response = await fetch('/api/HMS/session')
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      toast.error('加载用户信息失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('新密码与确认密码不匹配')
      return
    }

    try {
      setIsLoading(true)
      await userAPI.changePassword(user.UserID, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
      toast.success('密码修改成功')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('密码修改失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">修改密码</h3>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="当前密码"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
            isRequired
          />
          <Input
            label="新密码"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
            isRequired
          />
          <Input
            label="确认新密码"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            isRequired
          />
          <Button 
            color="primary" 
            type="submit"
            isLoading={isLoading}
          >
            修改密码
          </Button>
        </form>
      </CardBody>
    </Card>
  )
} 