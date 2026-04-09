import { expect, test } from '@playwright/test'

test('authenticate user for protected flows', async ({ page }) => {
  await page.goto('/sign-in')

  await page.getByLabel('이메일').fill('test@example.com')
  await page.locator('#password').fill('Password1')
  await page.getByRole('button', { name: '로그인' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('link', { name: '회원정보' })).toBeVisible()

  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
