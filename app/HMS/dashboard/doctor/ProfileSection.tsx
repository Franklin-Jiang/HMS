'use client'

import React from 'react'
import { Card, CardBody, Button, Input, Divider } from "@nextui-org/react"
import PageTitle from '../../components/PageTitle'
const { toast } = require('react-toastify')

interface DoctorProfile {
  DoctorID: number
  Name: string
  Gender: 'M' | 'F'
  Phone: string
  DepartmentName: string
}

export default function ProfileSection() {
  const [profile, setProfile] = React.useState<DoctorProfile | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const response = await fetch('/api/HMS/dashboard/doctor/profile')
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
    if (!profile) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/HMS/dashboard/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Phone: profile.Phone })
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('联系电话更新成功')
      setIsEditing(false)
    } catch (error) {
      toast.error('更新失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile) {
    return <div>加载中...</div>
  }

  return (
    <PageTitle title="医生个人信息">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardBody className="p-6">
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-xl font-semibold mb-4">个人信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">工号</div>
                    <div className="font-medium">{profile.DoctorID}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">姓名</div>
                    <div className="font-medium">{profile.Name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">性别</div>
                    <div className="font-medium">
                      {profile.Gender === 'M' ? '男' : '女'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">科室</div>
                    <div className="font-medium">{profile.DepartmentName}</div>
                  </div>
                </div>
              </div>

              <Divider/>

              {/* 联系方式 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">联系方式</h3>
                  {!isEditing && (
                    <Button 
                      color="primary" 
                      variant="flat"
                      size="sm"
                      onPress={() => setIsEditing(true)}
                    >
                      修改
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="max-w-md">
                    <Input
                      label="联系电话"
                      value={profile.Phone}
                      onChange={(e) => setProfile(prev => prev ? ({...prev, Phone: e.target.value}) : null)}
                      isRequired
                      pattern="^1[3-9]\d{9}$"
                      description="请输入11位手机号码"
                    />
                    <div className="flex gap-2 mt-4">
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
                        onPress={() => {
                          setIsEditing(false)
                          loadProfile()
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">联系电话</div>
                    <div className="font-medium">{profile.Phone}</div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageTitle>
  )
} 