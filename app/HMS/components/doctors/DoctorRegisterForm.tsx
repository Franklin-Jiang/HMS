'use client'

import { Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useState, useEffect } from "react"
import { authAPI, departmentAPI } from "../../services/api"
const { toast } = require('react-toastify');
import { Department } from "../../types"
import { useRouter } from 'next/navigation'

interface DoctorRegisterFormProps {
  onSuccess: () => void
}

interface DoctorFormData {
  Role: 'doctor'
  Username: string
  Password: string
  ConfirmPassword: string
  Name: string
  Gender: 'M' | 'F'
  Phone: string
  DepartmentID: string
}

export default function DoctorRegisterForm() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [formData, setFormData] = useState<DoctorFormData>({
    Role: 'doctor',
    Username: '',
    Password: '',
    ConfirmPassword: '',
    Name: '',
    Gender: 'M',
    Phone: '',
    DepartmentID: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadDepartments()
  }, [])

  async function loadDepartments() {
    try {
      const data = await departmentAPI.getList()
      setDepartments(data)
    } catch (error) {
      toast.error('加载科室列表失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.Password !== formData.ConfirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    if (formData.Name.length < 2) {
      toast.error('姓名至少需要2个字符')
      return
    }

    try {
      const response = await fetch('/api/HMS/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          Role: formData.Role.toLowerCase()
        })
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success(data.message)
      router.push('/HMS/login')
    } catch (error) {
      toast.error('注册失败，请稍后重试')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="用户名"
        value={formData.Username}
        onChange={(e) => setFormData(prev => ({ ...prev, Username: e.target.value }))}
        isRequired
      />
      <Input
        label="密码"
        type="password"
        value={formData.Password}
        onChange={(e) => setFormData(prev => ({ ...prev, Password: e.target.value }))}
        isRequired
      />
      <Input
        label="确认密码"
        type="password"
        value={formData.ConfirmPassword}
        onChange={(e) => setFormData(prev => ({ ...prev, ConfirmPassword: e.target.value }))}
        isRequired
      />
      <Input
        label="姓名"
        value={formData.Name}
        onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
        isRequired
        pattern="^[\u4e00-\u9fa5a-zA-Z0-9\s·.。-]+$"
      />
      <Select
        label="性别"
        value={formData.Gender}
        onChange={(e) => setFormData(prev => ({ ...prev, Gender: e.target.value as 'M' | 'F' }))}
        isRequired
      >
        <SelectItem key="M" value="M">男</SelectItem>
        <SelectItem key="F" value="F">女</SelectItem>
      </Select>
      <Input
        label="联系电话"
        value={formData.Phone}
        onChange={(e) => setFormData(prev => ({ ...prev, Phone: e.target.value }))}
        isRequired
      />
      <Select
        label="所属科室"
        value={formData.DepartmentID}
        onChange={(e) => setFormData(prev => ({ ...prev, DepartmentID: e.target.value }))}
        isRequired
      >
        {departments.map(dept => (
          <SelectItem key={dept.DepartmentID} value={dept.DepartmentID.toString()}>
            {dept.Name}
          </SelectItem>
        ))}
      </Select>
      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        fullWidth
      >
        提交注册申请
      </Button>
    </form>
  )
} 