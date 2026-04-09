import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/store/authStore'
import type { AuthTokenResponse } from '@/types/api'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type FailedQueueItem = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: FailedQueueItem[] = []
// 동시에 여러 401이 나와도 refresh 요청은 하나만 보내 재발급 폭주를 막습니다.

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error)
      return
    }

    resolve(token)
  })

  failedQueue = []
}

function setAuthorizationHeader(config: RetryableRequestConfig, token: string): void {
  config.headers.set('Authorization', `Bearer ${token}`)
}

function shouldSkipRefresh(config?: RetryableRequestConfig): boolean {
  const url = config?.url ?? ''
  // 로그인/재발급 자체가 실패한 경우까지 재시도하면 무한 루프가 생기므로 예외 처리합니다.
  return url.includes('/api/refresh') || url.includes('/api/sign-in')
}

export const apiClient = axios.create({
  baseURL: '/',
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  // Bearer 토큰은 항상 메모리 스토어에서만 읽어 주입하고, 브라우저 저장소는 사용하지 않습니다.
  if (token) {
    setAuthorizationHeader(config as RetryableRequestConfig, token)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined
    const { accessToken, isAuthenticated } = useAuthStore.getState()

    if (!config || error.response?.status !== 401 || config._retry || shouldSkipRefresh(config)) {
      return Promise.reject(error)
    }

    if (!isAuthenticated || !accessToken) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // 이미 재발급 중이면 현재 요청은 큐에 대기시켰다가 새 토큰으로 다시 보냅니다.
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        setAuthorizationHeader(config, token)
        return apiClient(config)
      })
    }

    config._retry = true
    isRefreshing = true

    try {
      // 재발급 성공 시 대기 중이던 요청과 현재 요청 모두 같은 새 access token으로 재시도합니다.
      const { data } = await axios.post<AuthTokenResponse>(
        '/api/refresh',
        {},
        {
          baseURL: '/',
          withCredentials: true,
        },
      )

      useAuthStore.getState().setAccessToken(data.accessToken)
      processQueue(null, data.accessToken)
      setAuthorizationHeader(config, data.accessToken)

      return apiClient(config)
    } catch (refreshError) {
      // refresh까지 실패하면 인증 상태를 비우고 전역 만료 다이얼로그로 재로그인을 유도합니다.
      processQueue(refreshError, null)
      const { logout, openSessionExpiredDialog } = useAuthStore.getState()

      logout()
      openSessionExpiredDialog()

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
