import { expect, test } from '@playwright/test'

test('authenticate user for protected flows', async ({ page }) => {
  await page.goto('/sign-in')

  // 개발 환경 MSW 핸들러에 고정된 테스트 계정입니다 (src/mocks/handlers.ts 참고).
  // 프로덕션에서는 실제 인증 서버의 계정으로 교체해야 합니다.
  await page.getByLabel('이메일').fill('test@example.com')
  await page.locator('#password').fill('Password1')
  await page.getByRole('button', { name: '로그인' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('link', { name: '회원정보' })).toBeVisible()

  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
