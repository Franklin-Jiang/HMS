'use client'

import React from 'react'
import { Card, CardHeader, CardBody, Tabs, Tab, Button } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../components/auth/ProtectedRoute"
import RoomAssignments from "./RoomAssignments"
import ProfileSection from "./ProfileSection"
import PageTitle from '../../components/PageTitle'
const { toast } = require('react-toastify')

export default function NurseDashboard() {
  const [selected, setSelected] = React.useState("rooms")
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/HMS/auth/logout', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('退出登录成功')
      router.push('/HMS/login')
    } catch (error) {
      toast.error('退出登录失败')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['nurse']}>
      <PageTitle title="护士工作台">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">护士工作台</h1>
            <Button
              color="danger"
              variant="light"
              onPress={handleLogout}
            >
              退出登录
            </Button>
          </div>

          <Tabs 
            selectedKey={selected} 
            onSelectionChange={(key) => setSelected(key.toString())}
          >
            <Tab key="rooms" title="工作台">
              <Card className="mt-4">
                <CardBody>
                  <RoomAssignments />
                </CardBody>
              </Card>
            </Tab>
            <Tab key="profile" title="个人信息">
              <Card className="mt-4">
                <CardBody>
                  <ProfileSection />
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </PageTitle>
    </ProtectedRoute>
  )
} 