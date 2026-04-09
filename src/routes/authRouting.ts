export type RouteAccessPolicy = 'public' | 'protected' | 'guest-only'

export function getRouteAccessPolicy(pathname: string): RouteAccessPolicy {
  // 경로 문자열만으로 접근 정책을 판별해 라우트 정의와 리다이렉트 판단이 같은 기준을 쓰게 합니다.
  if (pathname === '/sign-in') {
    return 'guest-only'
  }

  if (pathname === '/task' || pathname.startsWith('/task/') || pathname === '/user') {
    return 'protected'
  }

  return 'public'
}

export function getAuthRouteRedirect(
  pathname: string,
  isAuthenticated: boolean,
): '/' | null {
  const routeAccessPolicy = getRouteAccessPolicy(pathname)

  if (routeAccessPolicy === 'guest-only' && isAuthenticated) {
    return '/'
  }

  return null
}
