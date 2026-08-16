import { expect, test } from '@playwright/test'

/**
 * TC-01 ~ TC-06을 하나의 사용자 여정으로 검증한다.
 * 같은 BrowserContext의 두 Page를 사용해야 localStorage와 BroadcastChannel을 공유한다.
 */
test('키오스크 예매를 직원이 이어받아 완료하면 키오스크가 자동 완료된다', async ({ browser }) => {
  const context = await browser.newContext()
  const kioskPage = await context.newPage()
  const staffPage = await context.newPage()

  try {
    await kioskPage.goto('/kiosk')
    await kioskPage.getByRole('button', { name: '강릉' }).click()

    await expect(kioskPage.getByRole('heading', { name: '출발 날짜를 선택하세요' })).toBeVisible()
    await kioskPage.getByRole('button', { name: /오늘/ }).click()

    await expect(kioskPage.getByRole('heading', { name: '출발 시간을 선택하세요' })).toBeVisible()
    await kioskPage.getByRole('button', { name: /^11:30/ }).click()

    await expect(kioskPage.getByRole('heading', { name: '좌석을 선택하세요' })).toBeVisible()
    await kioskPage.getByRole('button', { name: '직원 도움 요청' }).click()
    await kioskPage.getByRole('button', { name: '여기까지 저장하고 도움받기' }).click()

    await expect(
      kioskPage.getByRole('heading', { name: '직원에게 이 번호를 알려주세요' }),
    ).toBeVisible()
    const transferCode = await kioskPage.getByText(/^\d{6}$/).textContent()
    expect(transferCode).toMatch(/^\d{6}$/)

    await staffPage.goto('/staff')
    await staffPage.locator('#transfer-code').fill(transferCode!)
    await staffPage.getByRole('button', { name: '예매 불러오기' }).click()
    await expect(staffPage.getByText('동서울 → 강릉')).toBeVisible()

    await staffPage.getByRole('button', { name: '이 예매 이어받기' }).click()
    await expect(staffPage.getByLabel('좌석 번호')).toBeVisible()
    await staffPage.getByLabel('좌석 번호').fill('7')
    await staffPage.getByRole('button', { name: '좌석 저장' }).click()
    await expect(staffPage.getByLabel('좌석 번호')).toHaveValue('7')

    await staffPage.getByRole('button', { name: '예매 완료 처리' }).click()
    await expect(staffPage.getByRole('heading', { name: '예매 완료' })).toBeVisible()
    await expect(kioskPage.getByRole('heading', { name: '예매가 완료되었습니다' })).toBeVisible()
    await expect(kioskPage.getByText('7번', { exact: true }).first()).toBeVisible()
  } finally {
    await context.close()
  }
})

test('존재하지 않는 이어하기 코드는 사용자에게 오류로 표시된다', async ({ page }) => {
  await page.goto('/staff')
  await page.locator('#transfer-code').fill('000000')
  await page.getByRole('button', { name: '예매 불러오기' }).click()

  await expect(
    page.getByText('해당 번호의 예매를 찾을 수 없습니다. 번호를 다시 확인해 주세요.'),
  ).toBeVisible()
})
