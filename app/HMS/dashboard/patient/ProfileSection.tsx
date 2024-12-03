'use client'

import React from 'react'
import { Input, Button } from "@nextui-org/react"
import { Patient } from "../../types"
import PageTitle from '../../components/PageTitle'
const { toast } = require('react-toastify')

export default function ProfileSection() {
  const [profile, setProfile] = React.useState<Patient | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    Phone: '',
    Address: '',
  })

  React.useEffect(() => {
    loadProfile()
  }, [])

  React.useEffect(() => {
    if (profile) {
      setFormData({
        Phone: profile.Phone,
        Address: profile.Address || '',
      })
    }
  }, [profile])

  async function loadProfile() {
    try {
      const response = await fetch('/api/HMS/dashboard/patient/profile')
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setProfile(data.profile)
    } catch (error) {
      toast.error('加载个人信息失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await fetch('/api/HMS/dashboard/patient/profile', {
        method: 'PUT',
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
      toast.success('个人信息更新成功')
      loadProfile()
      setIsEditing(false)
    } catch (error) {
      toast.error('更新失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile) return <div>加载中...</div>

  return (
    <PageTitle title="患者个人信息">
      <div className="space-y-4">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex gap-2">
              <Button 
                color="primary" 
                type="submit"
                isLoading={isLoading}
              >
                保存
              </Button>
              <Button 
                color="danger" 
                variant="light" 
                onPress={() => setIsEditing(false)}
              >
                取消
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">姓名</div>
              <div>{profile.Name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">性别</div>
              <div>{profile.Gender === 'M' ? '男' : '女'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">出生日期</div>
              <div>{new Date(profile.DateOfBirth).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">联系电话</div>
              <div>{profile.Phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">地址</div>
              <div>{profile.Address || '未设置'}</div>
            </div>
            <Button 
              color="primary"
              onPress={() => setIsEditing(true)}
            >
              编辑信息
            </Button>
          </div>
        )}
      </div>
    </PageTitle>
  )
} 