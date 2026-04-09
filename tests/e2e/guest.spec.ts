import { expect, test } from '@playwright/test'

test.describe('guest critical paths', () => {
  test('shows guest dashboard lock state on first visit', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible()
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible()
    await expect(page.getByRole('link', { name: '로그인하러 가기' })).toBeVisible()
    await expect(page.getByRole('link', { name: '로그인', exact: true })).toBeVisible()
  })

  test('redirects unauthenticated task access to sign-in', async ({ page }) => {
    await page.goto('/task')

    await expect(page).toHaveURL('/sign-in')
    await expect(page.getByRole('heading', { name: 'KB Health 로그인' })).toBeVisible()
  })

  test('renders shell-free global 404 page', async ({ page }) => {
    await page.goto('/does-not-exist')

    await expect(page.getByText('입력한 주소를 찾지 못했습니다')).toBeVisible()
    await expect(page.getByRole('link', { name: '대시보드로 가기' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: '주요 내비게이션' })).toHaveCount(0)
  })

  test('shows sign-in error modal for wrong credentials', async ({ page }) => {
    await page.goto('/sign-in')

    await page.getByLabel('이메일').fill('wrong@email.com')
    await page.locator('#password').fill('WrongPass1')
    await page.getByRole('button', { name: '로그인' }).click()

    await expect(page.getByText('로그인 실패')).toBeVisible()
    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible()
  })
})
