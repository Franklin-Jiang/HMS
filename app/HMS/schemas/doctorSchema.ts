import { z } from "zod"

export const doctorSchema = z.object({
  Name: z.string()
    .min(2, "姓名至少需要2个字符")
    .max(100, "姓名不能超过100个字符"),
  
  Gender: z.enum(["M", "F"], {
    required_error: "请选择性别",
    invalid_type_error: "性别格式无效",
  }),
  
  Phone: z.string()
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
  
  DepartmentID: z.number({
    required_error: "请选择科室",
    invalid_type_error: "科室ID必须是数字",
  }),
})

export type DoctorFormData = z.infer<typeof doctorSchema> 