import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/**
 * Mock Backend 시작.
 *
 * main.tsx 에서 USE_MOCK 일 때만 호출한다.
 * onUnhandledRequest: 'bypass' — 핸들러가 없는 요청(정적 파일 등)은 그대로 통과시킨다.
 */
export function startMockWorker() {
  return worker.start({
    onUnhandledRequest: 'bypass',
    quiet: false,
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
}
