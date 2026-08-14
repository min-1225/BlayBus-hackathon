import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { USE_MOCK } from './config/env.ts'
import './index.css'

/**
 * Mock Backend 를 먼저 띄운 뒤 앱을 렌더링한다.
 *
 * 순서가 중요하다. Worker 등록 전에 렌더링하면 첫 요청이 가로채이지 않아
 * "가끔 404가 난다" 같은 재현 어려운 버그가 생긴다.
 */
async function bootstrap() {
  if (USE_MOCK) {
    const { startMockWorker } = await import('./mocks/browser.ts')
    await startMockWorker()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
