import {
    Patient,
    PatientFormData,
    Doctor,
    DoctorFormData,
    Department,
    DepartmentFormData,
    Room,
    RoomFormData,
    TreatmentRecord,
    TreatmentRecordFormData,
    Medicine,
    MedicineFormData,
    Examination,
    ExaminationFormData,
    Nurse,
    NurseFormData,
    UserAccount,
    UserAccountFormData
} from "../types"

const API_BASE = '/api/HMS'

export async function fetchData<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '请求失败')
    }

    const data = await response.json()
    return data
}

// 患者相关 API
export const patientAPI = {
    // 获取患者列表
    getList: async () => {
        const response = await fetchData<{ data: Patient[] }>('?type=patients')
        return response.data
    },

    // 添加患者
    add: async (data: PatientFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'POST',
            body: JSON.stringify({
                type: 'patient',
                data,
            }),
        })
    },

    // 更新患者信息
    update: async (id: number, data: PatientFormData, userType: string) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'PUT',
            body: JSON.stringify({
                type: 'patient',
                id,
                data,
                userType,
            }),
        })
    },

    // 删除患者
    delete: async (id: number, adminToken: string) => {
        return await fetchData<{ message: string }>(
            `?type=patient&id=${id}&adminToken=${adminToken}`,
            {
                method: 'DELETE',
            }
        )
    },
}

// 医生相关 API
export const doctorAPI = {
    // 获取医生列表
    getList: async () => {
        const response = await fetchData<{ data: Doctor[] }>('?type=doctors')
        return response.data
    },

    // 添加医生
    add: async (data: DoctorFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'POST',
            body: JSON.stringify({
                type: 'doctor',
                data: {
                    ...data,
                    adminToken: 'admin-token', // TODO: 使用真实的管理员令牌
                },
            }),
        })
    },

    // 更新医生信息
    update: async (id: number, data: DoctorFormData, userType: string) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'PUT',
            body: JSON.stringify({
                type: 'doctor',
                id,
                data,
                userType,
            }),
        })
    },

    // 删除医生
    delete: async (id: number, adminToken: string) => {
        return await fetchData<{ message: string }>(
            `?type=doctor&id=${id}&adminToken=${adminToken}`,
            {
                method: 'DELETE',
            }
        )
    },
}

// 科室相关 API
export const departmentAPI = {
    // 获取科室列表
    getList: async () => {
        const response = await fetchData<{ data: Department[] }>('?type=departments')
        return response.data
    },

    // 添加科室
    add: async (data: DepartmentFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'POST',
            body: JSON.stringify({
                type: 'department',
                data,
                adminToken: 'admin-token', // TODO: 使用真实的管理员令牌
            }),
        })
    },

    // 更新科室信息
    update: async (id: number, data: DepartmentFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'PUT',
            body: JSON.stringify({
                type: 'department',
                id,
                data,
                adminToken: 'admin-token', // TODO: 使用真实的管理员令牌
            }),
        })
    },

    // 删除科室
    delete: async (id: number, adminToken: string) => {
        return await fetchData<{ message: string }>(
            `?type=department&id=${id}&adminToken=${adminToken}`,
            {
                method: 'DELETE',
            }
        )
    },
}

// 房间相关 API
export const roomAPI = {
    // 获取房间列表
    getList: async () => {
        const response = await fetchData<{ data: Room[] }>('?type=rooms')
        return response.data
    },

    // 添加房间
    add: async (data: RoomFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'POST',
            body: JSON.stringify({
                type: 'room',
                data,
                adminToken: 'admin-token', // TODO: 使用真实的管理员令牌
            }),
        })
    },

    // 更新房间信息
    update: async (id: number, data: RoomFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'PUT',
            body: JSON.stringify({
                type: 'room',
                id,
                data,
                adminToken: 'admin-token', // TODO: 使用真实的管理员令牌
            }),
        })
    },

    // 删除房间
    delete: async (id: number, adminToken: string) => {
        return await fetchData<{ message: string }>(
            `?type=room&id=${id}&adminToken=${adminToken}`,
            {
                method: 'DELETE',
            }
        )
    },
}

// 治疗记录相关 API
export const treatmentAPI = {
    getList: async (patientId?: number) => {
        const endpoint = patientId ? `?type=treatments&patientId=${patientId}` : '?type=treatments'
        const response = await fetchData<{ data: TreatmentRecord[] }>(endpoint)
        return response.data
    },

    add: async (data: TreatmentRecordFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'POST',
            body: JSON.stringify({
                type: 'treatment',
                data,
                adminToken: 'admin-token',
            }),
        })
    },

    update: async (id: number, data: TreatmentRecordFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'PUT',
            body: JSON.stringify({
                type: 'treatment',
                id,
                data,
                adminToken: 'admin-token',
            }),
        })
    },
}

// 药房相关 API
export const medicineAPI = {
    getList: async () => {
        const response = await fetchData<{ data: Medicine[] }>('?type=medicines')
        return response.data
    },

    add: async (data: MedicineFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'POST',
            body: JSON.stringify({
                type: 'medicine',
                data,
                adminToken: 'admin-token',
            }),
        })
    },

    update: async (id: number, data: MedicineFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'PUT',
            body: JSON.stringify({
                type: 'medicine',
                id,
                data,
                adminToken: 'admin-token',
            }),
        })
    },
}

// 护士相关 API
export const nurseAPI = {
    getList: async () => {
        const response = await fetchData<{ data: Nurse[] }>('?type=nurses')
        return response.data
    },

    add: async (data: NurseFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'POST',
            body: JSON.stringify({
                type: 'nurse',
                data,
                adminToken: 'admin-token',
            }),
        })
    },

    update: async (id: number, data: NurseFormData) => {
        return await fetchData<{ message: string; data: any }>('', {
            method: 'PUT',
            body: JSON.stringify({
                type: 'nurse',
                id,
                data,
                adminToken: 'admin-token',
            }),
        })
    },
}

// 用户认证 API
export const authAPI = {
    login: async (username: string, password: string) => {
        return await fetchData<{ token: string; user: UserAccount }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        })
    },

    register: async (data: UserAccountFormData) => {
        return await fetchData<{ message: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    verifyDoctor: async (doctorId: number) => {
        return await fetchData<{ message: string }>('/auth/verify-doctor', {
            method: 'POST',
            body: JSON.stringify({
                doctorId,
                adminToken: 'admin-token',
            }),
        })
    },
} 