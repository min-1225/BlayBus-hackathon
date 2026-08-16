import { defineConfig, devices } from '@playwright/test'

/**
 * 실제 브라우저 + MSW Mock Backend로 핵심 데모 흐름을 검증한다.
 * 개발 서버(5173)와 충돌하지 않도록 E2E 전용 포트 4174를 사용한다.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4174',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 4174',
    url: 'http://localhost:4174',
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_USE_MOCK: 'true',
    },
  },
})
