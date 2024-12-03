'use client'

import { Card, CardBody, CardHeader, Button, Input } from "@nextui-org/react"
import { useState, useEffect } from "react"
const { toast } = require('react-toastify');
import { userAPI } from "../../services/userService"

export default function UserProfile() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    try {
      const response = await fetch('/api/HMS/session')
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
        setFormData({
          phone: data.user.Phone || '',
          address: data.user.Address || '',
        })
      }
    } catch (error) {
      toast.error('加载用户信息失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsLoading(true)
      await userAPI.updateProfile(user.UserID, formData)
      toast.success('个人信息更新成功')
      setIsEditing(false)
      loadUserProfile()  // 重新加载用户信息
    } catch (error) {
      toast.error('更新失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-medium">个人信息</h3>
        <Button
          color="primary"
          variant="light"
          onPress={() => setIsEditing(!isEditing)}
          isLoading={isLoading}
        >
          {isEditing ? '取消' : '编辑'}
        </Button>
      </CardHeader>
      <CardBody>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="联系电话"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
            <Input
              label="地址"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
            <Button color="primary" type="submit">
              保存
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p>用户名：{user?.Username}</p>
            <p>角色：{user?.Role}</p>
            <p>联系电话：{formData.phone}</p>
            <p>地址：{formData.address}</p>
          </div>
        )}
      </CardBody>
    </Card>
  )
} 