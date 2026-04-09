export type SignInRequest = {
  email: string
  password: string
}

export type AuthTokenResponse = {
  accessToken: string
  refreshToken: string
}

export type UserResponse = {
  name: string
  memo: string
}

export type DashboardResponse = {
  numOfTask: number
  numOfRestTask: number
  numOfDoneTask: number
}

export type TaskStatus = 'TODO' | 'DONE'

export type TaskItem = {
  id: string
  title: string
  memo: string
  status: TaskStatus
}

export type TaskListResponse = {
  data: TaskItem[]
  hasNext: boolean
}

export type TaskDetailResponse = {
  title: string
  memo: string
  registerDatetime: string
  status: TaskStatus
}

export type DeleteTaskResponse = {
  success: true
}

export type ErrorResponse = {
  errorMessage: string
}
