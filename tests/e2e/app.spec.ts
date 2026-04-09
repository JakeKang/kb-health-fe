import { expect, test } from '@playwright/test'

test.describe('authenticated critical paths', () => {
  test('dashboard card opens task list and detail can return to list', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible()
    await page.getByRole('link', { name: /전체 할 일: \d+/ }).click()

    await expect(page).toHaveURL('/task')
    await expect(page.getByRole('heading', { name: '할 일 목록' })).toBeVisible()

    await page.locator('[data-task-card]').first().click()
    await expect(page).toHaveURL(/\/task\/task-\d+$/)
    await expect(page.getByText('상태 변경')).toBeVisible()

    await page.getByRole('button', { name: '목록으로' }).click()
    await expect(page).toHaveURL('/task')
  })

  test('loads more tasks during infinite scroll', async ({ page }) => {
    await page.goto('/task')

    await expect(page.getByText('아침 복약 체크 메모 남기기')).toHaveCount(0)

    const scrollContainer = page.locator('[data-scroll-container="true"]')
    await scrollContainer.evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })

    await expect(page.getByText('아침 복약 체크 메모 남기기')).toBeVisible()
  })

  test('deletes a task and can log out back to the public dashboard', async ({ page }) => {
    await page.goto('/task')

    const firstCard = page.locator('[data-task-card]').first()
    await expect(firstCard).toContainText('아침 복약 체크 마무리하기')

    await firstCard.click()
    await expect(page).toHaveURL('/task/task-1')

    await page.getByRole('button', { name: '삭제' }).click()
    await page.getByLabel('삭제 확인용 ID').fill('task-1')
    await page.getByRole('button', { name: '삭제하기' }).click()

    await expect(page).toHaveURL('/task')
    await expect(page.getByText('아침 복약 체크 마무리하기')).toHaveCount(0)

    await page.getByRole('button', { name: '로그아웃', exact: true }).click()
    await expect(page.getByText('로그아웃할까요?')).toBeVisible()
    await page.getByRole('button', { name: '로그아웃', exact: true }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible()
  })

  test('shows user info and task-missing fallback', async ({ page }) => {
    await page.goto('/user')

    await expect(page.getByRole('heading', { name: '회원정보' })).toBeVisible()
    await expect(page.locator('main').getByText('김건강').first()).toBeVisible()
    await expect(page.locator('main').getByText('KB헬스 직원입니다.')).toBeVisible()

    await page.goto('/task/task-999')
    await expect(page.getByText('찾으시는 할 일이 없습니다')).toBeVisible()
    await expect(page.getByRole('button', { name: '목록으로 돌아가기' })).toBeVisible()
  })

})
