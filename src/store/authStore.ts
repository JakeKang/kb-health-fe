import { create } from 'zustand'

type AuthState = {
  accessToken: string | null
  isAuthenticated: boolean
  isSessionExpiredDialogOpen: boolean
  setTokens: (accessToken: string, refreshToken: string) => void
  setAccessToken: (token: string) => void
  openSessionExpiredDialog: () => void
  closeSessionExpiredDialog: () => void
  logout: () => void
}

function setRefreshTokenCookie(refreshToken: string): void {
  if (typeof document === 'undefined') return

  // refresh token만 쿠키에 남겨 두어 access token 영속화 없이도 초기 복구와 재발급을 가능하게 합니다.
  document.cookie = `token=${refreshToken}; path=/; SameSite=Lax`
}

function clearRefreshTokenCookie(): void {
  if (typeof document === 'undefined') return

  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax'
}

export const useAuthStore = create<AuthState>((set) => ({
  // access token은 의도적으로 메모리에만 두고, 새로고침 후에는 /api/refresh로만 다시 복구합니다.
  accessToken: null,
  isAuthenticated: false,
  isSessionExpiredDialogOpen: false,
  setTokens: (accessToken, refreshToken) => {
    setRefreshTokenCookie(refreshToken)
    set({ accessToken, isAuthenticated: true, isSessionExpiredDialogOpen: false })
  },
  setAccessToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: true,
      isSessionExpiredDialogOpen: false,
    }),
  openSessionExpiredDialog: () => set({ isSessionExpiredDialogOpen: true }),
  closeSessionExpiredDialog: () => set({ isSessionExpiredDialogOpen: false }),
  logout: () => {
    clearRefreshTokenCookie()
    set({
      accessToken: null,
      isAuthenticated: false,
      isSessionExpiredDialogOpen: false,
    })
  },
}))
