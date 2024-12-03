'use client'

import { Card, Button } from "@nextui-org/react"
import LoginForm from "../components/auth/LoginForm"
import { useRouter } from "next/navigation"
import PageTitle from '../components/PageTitle'

export default function LoginPage() {
  const router = useRouter()

  return (
    <PageTitle title="登录">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            color="default"
            variant="light"
            onPress={() => router.push('/HMS')}
          >
            返回
          </Button>
          <h1 className="text-2xl font-bold">登录</h1>
        </div>
        <Card className="max-w-md mx-auto p-6">
          <LoginForm />
        </Card>
      </div>
    </PageTitle>
  )
} 