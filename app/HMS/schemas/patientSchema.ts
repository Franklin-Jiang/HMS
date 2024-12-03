import { z } from "zod"

export const patientSchema = z.object({
  Name: z.string()
    .min(2, "姓名至少需要2个字符")
    .max(100, "姓名不能超过100个字符"),
  
  Gender: z.enum(["M", "F"], {
    required_error: "请选择性别",
    invalid_type_error: "性别格式无效",
  }),
  
  DateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "出生日期格式无效")
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      return birthDate <= today
    }, "出生日期不能晚于今天"),
  
  Phone: z.string()
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
  
  Address: z.string()
    .min(5, "地址至少需要5个字符")
    .max(255, "地址不能超过255个字符")
    .optional(),
})

export type PatientFormData = z.infer<typeof patientSchema> 