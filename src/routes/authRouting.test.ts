import { describe, expect, it } from 'vitest'

import { getAuthRouteRedirect, getRouteAccessPolicy } from '@/routes/authRouting'

describe('getRouteAccessPolicy', () => {
  it('keeps the dashboard route public', () => {
    expect(getRouteAccessPolicy('/')).toBe('public')
  })

  it('treats task and user routes as protected', () => {
    expect(getRouteAccessPolicy('/task')).toBe('protected')
    expect(getRouteAccessPolicy('/task/42')).toBe('protected')
    expect(getRouteAccessPolicy('/user')).toBe('protected')
  })
})

describe('getAuthRouteRedirect', () => {
  it('allows public dashboard access without authentication', () => {
    expect(getAuthRouteRedirect('/', false)).toBeNull()
  })

  it('keeps unauthenticated task access dialog-first', () => {
    expect(getAuthRouteRedirect('/task', false)).toBeNull()
    expect(getAuthRouteRedirect('/task/42', false)).toBeNull()
    expect(getAuthRouteRedirect('/user', false)).toBeNull()
  })

  it('keeps authenticated users out of the sign-in screen', () => {
    expect(getAuthRouteRedirect('/sign-in', true)).toBe('/')
  })
})
