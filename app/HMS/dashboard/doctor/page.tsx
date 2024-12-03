'use client'

import React from 'react'
import { Card, CardBody, Tabs, Tab, Button } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../components/auth/ProtectedRoute"
import TreatmentRecords from "./TreatmentRecords"
import ProfileSection from "./ProfileSection"
const { toast } = require('react-toastify')

export default function DoctorDashboard() {
  const [selected, setSelected] = React.useState("records")
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
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">医生工作台</h1>
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
          <Tab key="records" title="诊疗记录">
            <Card className="mt-4">
              <CardBody>
                <TreatmentRecords />
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
    </ProtectedRoute>
  )
} 