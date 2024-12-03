'use client'

import React from 'react'
import { Card, CardHeader, CardBody, Tabs, Tab, Button } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../components/auth/ProtectedRoute"
import ProfileSection from "./ProfileSection"
import TreatmentRecords from "./TreatmentRecords"
import PageTitle from '../../components/PageTitle'

export default function PatientDashboard() {
  const [selectedTab, setSelectedTab] = React.useState("profile")
  const router = useRouter()

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <PageTitle title="患者中心">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button
                color="default"
                variant="light"
                onPress={() => router.push('/HMS')}
              >
                返回
              </Button>
              <h1 className="text-2xl font-bold">患者中心</h1>
            </div>
          </div>

          <Tabs 
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key.toString())}
          >
            <Tab key="profile" title="个人信息">
              <Card className="mt-4">
                <CardBody>
                  <ProfileSection />
                </CardBody>
              </Card>
            </Tab>
            <Tab key="records" title="看病记录">
              <Card className="mt-4">
                <CardBody>
                  <TreatmentRecords />
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </PageTitle>
    </ProtectedRoute>
  )
} 