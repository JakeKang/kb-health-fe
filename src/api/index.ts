import type {
  AuthTokenResponse,
  DashboardResponse,
  DeleteTaskResponse,
  SignInRequest,
  TaskDetailResponse,
  TaskListResponse,
  TaskStatus,
  UserResponse,
} from '@/types/api'

import { apiClient } from './client'

export const signIn = (data: SignInRequest) =>
  apiClient.post<AuthTokenResponse>('/api/sign-in', data)

export const refreshToken = () => apiClient.post<AuthTokenResponse>('/api/refresh')

export const getUser = () => apiClient.get<UserResponse>('/api/user')

export const getDashboard = () => apiClient.get<DashboardResponse>('/api/dashboard')

export const getTasks = (page: number) =>
  apiClient.get<TaskListResponse>('/api/task', { params: { page } })

export const getTask = (id: string) => apiClient.get<TaskDetailResponse>(`/api/task/${id}`)

export const deleteTask = (id: string) => apiClient.delete<DeleteTaskResponse>(`/api/task/${id}`)

export const updateTaskStatus = (id: string, status: TaskStatus) =>
  apiClient.patch<DeleteTaskResponse>(`/api/task/${id}`, { status })

export { apiClient }
