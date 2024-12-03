// 房间相关类型
export type RoomType = 'ward' | 'icu' | 'operating'
export type RoomStatus = 'available' | 'occupied' | 'maintenance'

// 护士班次类型
export type NurseShift = 'morning' | 'afternoon' | 'night'

// 房间类型定义
export interface Room {
  RoomID: number
  RoomNumber: string
  RoomType: RoomType
  Floor: number
  Building: string
  BedCount: number
  Description?: string
  Status: RoomStatus
  CreatedAt: string
  UpdatedAt: string
  isActive: boolean
}

// 房间表单数据类型
export interface RoomFormData {
  RoomNumber: string
  RoomType: RoomType
  Floor: string
  Building: string
  BedCount: string
  Description: string
  Status: RoomStatus
}

// 护士类型定义
export interface Nurse {
  NurseID: number
  Name: string
  Gender: 'M' | 'F'
  Phone: string
  Shift: NurseShift
  isVerified: boolean
  CreatedAt: string
  UpdatedAt: string
}

// 添加一个新的会话类型
export interface SessionUser {
  UserID: number
  Username: string
  Role: 'admin' | 'doctor' | 'nurse' | 'patient'
  RelatedID: number
}

// 原有的 UserAccount 类型保持不变
export interface UserAccount {
  UserID: number
  Username: string
  Password: string
  Role: 'admin' | 'doctor' | 'nurse' | 'patient'
  RelatedID: number
  LastLogin: string | null
  CreatedAt: string
  UpdatedAt: string
}

// 常量映射
const ROOM_TYPE_MAP_CONST = {
  ward: '普通病房',
  icu: '重症监护室',
  operating: '手术室'
} as const

export const ROOM_TYPE_MAP = ROOM_TYPE_MAP_CONST

export const ROOM_STATUS_MAP = {
  available: '可用',
  occupied: '占用',
  maintenance: '维护中'
} as const

export const SHIFT_MAP = {
  morning: '早班',
  afternoon: '午班',
  night: '晚班'
} as const

// 类型辅助函数
export const getRoomTypeDisplay = (type: string): string => {
  const validTypes = ['ward', 'icu', 'operating']
  if (validTypes.includes(type)) {
    return ROOM_TYPE_MAP_CONST[type as RoomType]
  }
  return type
}

// 导出类型
export type RoomTypeMap = typeof ROOM_TYPE_MAP
export type RoomStatusMap = typeof ROOM_STATUS_MAP
export type ShiftMap = typeof SHIFT_MAP 