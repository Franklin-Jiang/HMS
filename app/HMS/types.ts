import { z } from 'zod'
import { patientSchema } from './schemas/patientSchema'

// 数据库模型类型
export interface Patient {
    PatientID: number
    Name: string
    Gender: 'M' | 'F'
    DateOfBirth: string
    Phone: string
    Address: string
    RoomID: number | null
}

export interface Doctor {
    DoctorID: number
    Name: string
    Gender: 'M' | 'F'
    Phone: string
    DepartmentID: number
}

export interface Department {
    DepartmentID: number
    Name: string
}

export interface Room {
    RoomID: number
    RoomNumber: string
    RoomType: 'ward' | 'icu' | 'operating'
    Floor: number
    Building: string
    BedCount: number
    Description?: string
    Status: 'available' | 'occupied' | 'maintenance'
    DepartmentID?: number
}

// 治疗记录
export interface TreatmentRecord {
    RecordID: number
    PatientID: number
    DoctorID: number
    Diagnosis: string
    Treatment: string
    Date: string
    Medications: string[]
}

// 药品
export interface Medicine {
    MedicineID: number
    Name: string
    Stock: number
    Unit: string
    Description: string
}

// 检查结果
export interface Examination {
    ExamID: number
    PatientID: number
    DoctorID: number
    ExamType: string
    Result: string
    Date: string
    Notes: string
}

// 护士
export interface Nurse {
    NurseID: number
    Name: string
    Gender: 'M' | 'F'
    Phone: string
    Shift: 'morning' | 'afternoon' | 'night'
    AssignedRooms: {
        RoomID: number
        RoomNumber: string
        RoomType: 'ward' | 'icu' | 'operating'
    }[]
}

// 用户账户
export interface UserAccount {
    UserID: number
    Username: string
    Password: string // 注意：实际存储时应该是加密的
    Role: 'patient' | 'doctor' | 'nurse' | 'admin'
    RelatedID: number // PatientID/DoctorID/NurseID
}

// 用于会话的用户类型
export interface SessionUser {
    UserID: number
    Username: string
    Role: 'patient' | 'doctor' | 'nurse' | 'admin'
    RelatedID: number
}

// 表单数据类型
export type PatientFormData = z.infer<typeof patientSchema>

export interface DoctorFormData {
    Name: string
    Gender: 'M' | 'F'
    Phone: string
    DepartmentID: number
}

export interface DepartmentFormData {
    Name: string
}

export interface RoomFormData {
    RoomNumber: string
    RoomType: 'ward' | 'icu' | 'operating'
    Floor: string
    Building: string
    BedCount: string
    Description: string
    Status: 'available' | 'occupied' | 'maintenance'
}

export interface TreatmentRecordFormData {
    PatientID: number
    DoctorID: number
    Diagnosis: string
    Treatment: string
    Medications: string[]
}

export interface MedicineFormData {
    Name: string
    Stock: number
    Unit: string
    Description: string
}

export interface ExaminationFormData {
    PatientID: number
    DoctorID: number
    ExamType: string
    Result: string
    Notes: string
}

export interface NurseFormData {
    Name: string
    Gender: 'M' | 'F'
    Phone: string
    RoomID: number | null
    Shift: 'morning' | 'afternoon' | 'night'
}

export interface UserAccountFormData {
    Username: string
    Password: string
    Role: 'patient' | 'doctor' | 'nurse' | 'admin'
    RelatedID: number
    AdminCode?: string
    Name?: string
    Gender?: 'M' | 'F'
    Phone?: string
    DepartmentID?: number
    DateOfBirth?: string
    Address?: string
    RoomID?: number | null
    Shift?: 'morning' | 'afternoon' | 'night'
}

export type RoomType = 'ward' | 'icu' | 'operating'