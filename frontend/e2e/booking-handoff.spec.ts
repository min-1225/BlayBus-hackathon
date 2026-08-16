import { expect, test } from '@playwright/test'

test('메인에서 고객용을 선택해 결제 완료까지 진행한다', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /버스표 예매/ }).click()
  await page.getByRole('button', { name: '강릉' }).click()
  await page.getByRole('button', { name: /오늘/ }).click()
  await page.getByRole('button', { name: /^11:30/ }).click()
  await page.getByRole('button', { name: '7번 좌석', exact: true }).click()

  await expect(page.getByRole('heading', { name: '예매 내용을 확인하세요' })).toBeVisible()
  await page.getByRole('button', { name: '결제하기' }).click()
  await page.getByRole('button', { name: '신용/체크카드' }).click()
  await page.getByRole('button', { name: '결제 완료' }).click()

  await expect(page.getByRole('heading', { name: '예매가 완료되었습니다' })).toBeVisible()
  await expect(page.getByText('7번', { exact: true }).first()).toBeVisible()
})

test('좁은 화면에서도 날짜 선택 문구가 버튼 안에서 잘리지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/kiosk')
  await page.getByRole('button', { name: '강릉' }).click()

  const dateOptions = page.getByTestId('date-option')
  await expect(dateOptions).toHaveCount(7)

  const allFitInsideButtons = await dateOptions.evaluateAll((buttons) =>
    buttons.every(
      (button) =>
        button.scrollHeight <= button.clientHeight && button.scrollWidth <= button.clientWidth,
    ),
  )
  expect(allFitInsideButtons).toBe(true)
})

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
    await kioskPage.getByRole('button', { name: '춘천' }).click()

    await expect(kioskPage.getByRole('heading', { name: '출발 날짜를 선택하세요' })).toBeVisible()
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
    await expect(staffPage.getByText('동서울 → 춘천')).toBeVisible()

    await staffPage.getByRole('button', { name: '이 예매 이어받기' }).click()
    await expect(staffPage.getByText('미완료 항목 · 날짜, 시간, 버스, 좌석')).toBeVisible()
    await expect(staffPage.getByRole('button', { name: '예매 완료 처리' })).toBeDisabled()

    const staffDate = staffPage.getByLabel('출발 날짜')
    await expect(staffDate.locator('option')).toHaveCount(8)
    await staffDate.selectOption({ index: 1 })
    const selectedTravelDate = await staffDate.inputValue()
    await staffPage.getByLabel('출발 시간과 버스').selectOption('12:15|STANDARD')
    await expect(staffPage.getByLabel('좌석 번호')).toBeVisible()
    await expect(staffPage.getByLabel('좌석 번호').locator('option[value="3"]')).toHaveCount(0)
    await expect(staffPage.getByLabel('좌석 번호').locator('option[value="21"]')).toHaveCount(0)
    await staffPage.getByLabel('좌석 번호').selectOption('7')
    await staffPage.getByRole('button', { name: '예매 정보 저장' }).click()
    await expect(staffPage.getByText(selectedTravelDate, { exact: true })).toBeVisible()
    await expect(staffPage.getByText('12:15', { exact: true })).toBeVisible()
    await expect(staffPage.getByText('일반', { exact: true })).toBeVisible()
    await expect(staffPage.getByLabel('좌석 번호')).toHaveValue('7')
    await expect(staffPage.getByText(/미완료 항목/)).toHaveCount(0)

    await staffPage.getByRole('button', { name: '예매 완료 처리' }).click()
    await expect(staffPage.getByRole('heading', { name: '예매 완료' })).toBeVisible()
    await expect(kioskPage.getByRole('heading', { name: '예매가 완료되었습니다' })).toBeVisible()
    await expect(kioskPage.getByText('7번', { exact: true }).first()).toBeVisible()

    await expect
      .poll(() => kioskPage.evaluate(() => sessionStorage.getItem('kiobridge:kiosk:sessionId')))
      .toBeNull()

    await kioskPage.goto('/')
    await kioskPage.getByRole('link', { name: /버스표 예매/ }).click()
    await expect(
      kioskPage.getByRole('heading', { name: '출발지와 도착지를 선택하세요' }),
    ).toBeVisible()
    await expect(kioskPage.getByText('미선택', { exact: true })).toHaveCount(4)

    await kioskPage.getByRole('button', { name: '속초' }).click()
    await expect(kioskPage.getByRole('heading', { name: '출발 날짜를 선택하세요' })).toBeVisible()
    await expect(kioskPage.getByText('속초', { exact: true })).toBeVisible()
    await expect(kioskPage.getByRole('alert')).toHaveCount(0)
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
