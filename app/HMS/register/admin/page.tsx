'use client'

import { Card, CardBody } from "@nextui-org/react"
import AdminRegisterForm from "../../components/admin/AdminRegisterForm"

export default function AdminRegisterPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardBody>
            <h1 className="text-2xl font-bold text-center mb-6">管理员注册</h1>
            <AdminRegisterForm />
          </CardBody>
        </Card>
      </div>
    </div>
  )
} 