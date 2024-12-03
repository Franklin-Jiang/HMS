import { fetchData } from './api'
import { UserAccount } from '../types'

export const userAPI = {
  // 更新用户信息
  updateProfile: async (userId: number, data: { phone: string; address: string }) => {
    return await fetchData<{ message: string }>('/api/HMS/user/profile', {
      method: 'PUT',
      body: JSON.stringify({
        userId,
        data,
      }),
    })
  },

  // 修改密码
  changePassword: async (userId: number, data: { 
    currentPassword: string; 
    newPassword: string 
  }) => {
    return await fetchData<{ message: string }>('/api/HMS/user/password', {
      method: 'PUT',
      body: JSON.stringify({
        userId,
        data,
      }),
    })
  },

  // 获取用户详细信息
  getProfile: async (userId: number) => {
    return await fetchData<{ data: UserAccount }>(`/api/HMS/user/${userId}`)
  },
} 