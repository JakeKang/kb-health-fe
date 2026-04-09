import { useEffect } from 'react'

import {
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'

import AppLayout from '@/layouts/AppLayout'
import RootLayout from '@/layouts/RootLayout'
import DashboardPage from '@/pages/DashboardPage'
import NotFoundPage from '@/pages/NotFoundPage'
import SignInPage from '@/pages/SignInPage'
import TaskDetailPage from '@/pages/TaskDetailPage'
import TaskListPage from '@/pages/TaskListPage'
import { getAuthRouteRedirect } from '@/routes/authRouting'
import UserPage from '@/pages/UserPage'
import { useAuthStore } from '@/store/authStore'

function ProtectedRouteGate(): JSX.Element | null {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const openSessionExpiredDialog = useAuthStore(
    (state) => state.openSessionExpiredDialog,
  )

  useEffect(() => {
    if (!isAuthenticated) {
      openSessionExpiredDialog()
    }
  }, [isAuthenticated, openSessionExpiredDialog])

  if (!isAuthenticated) {
    return null
  }

  return <Outlet />
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell',
  component: AppLayout,
})

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: SignInPage,
  beforeLoad: () => {
    // 로그인된 사용자는 로그인 화면으로 되돌리지 않고 앱 본문으로 바로 보냅니다.
    const redirectTo = getAuthRouteRedirect('/sign-in', useAuthStore.getState().isAuthenticated)

    if (redirectTo) {
      throw redirect({ to: redirectTo })
    }
  },
})

const protectedRoute = createRoute({
  getParentRoute: () => shellRoute,
  id: 'protected',
  component: ProtectedRouteGate,
})

const dashboardRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
  component: DashboardPage,
})

const taskListRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/task',
  component: TaskListPage,
})

const taskDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/task/$id',
  component: TaskDetailPage,
})

const userRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/user',
  component: UserPage,
})

const routeTree = rootRoute.addChildren([
  signInRoute,
  // shell 내부에서는 대시보드는 public, task/user 계열만 protected로 분리합니다.
  shellRoute.addChildren([
    dashboardRoute,
    protectedRoute.addChildren([taskListRoute, taskDetailRoute, userRoute]),
  ]),
])

export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
