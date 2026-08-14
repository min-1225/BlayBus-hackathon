import { useNavigate } from 'react-router'
import type { ReactNode } from 'react'
import { StepIndicator } from './StepIndicator'
import { useKioskSession } from '@/session/kioskSessionContext'
import type { BookingStep } from '@/types/session'

/**
 * 모든 Kiosk 화면의 공통 껍데기.
 *
 * - 상단: 진행 단계 표시
 * - 중앙: 큰 질문 + 화면 내용
 * - 하단: 항상 보이는 도움 버튼 (MVP MUST 항목)
 *
 * 새 Kiosk 화면을 만들 때는 이 레이아웃으로 감싼다.
 */
export function KioskLayout({
  step,
  question,
  children,
  showHelp = true,
}: {
  step: BookingStep
  /** 화면 맨 위 큰 질문. 예: "어디로 가시나요?" */
  question: string
  children: ReactNode
  /** 완료 화면처럼 도움 버튼이 필요 없는 경우 false. */
  showHelp?: boolean
}) {
  const navigate = useNavigate()
  const { error, clearError } = useKioskSession()

  return (
    <div className="min-h-dvh bg-[#20252b] p-0 lg:p-6">
      <div className="bg-surface mx-auto flex min-h-dvh max-w-6xl flex-col shadow-2xl lg:min-h-[calc(100dvh-3rem)]">
        <header className="border-brand border-b-4 bg-[#eef1f4] px-6 py-5 lg:px-10">
          <div className="border-line mb-5 flex items-center justify-between border-b pb-3">
            <p className="text-kiosk-label text-brand-strong font-bold tracking-wide">
              KIOBRIDGE BUS
            </p>
            <p className="text-kiosk-label text-muted">승차권 발권</p>
          </div>
          <StepIndicator current={step} />
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-9 lg:px-10 lg:py-12">
          <h1 className="text-kiosk-title border-brand mb-10 border-l-8 pl-5 font-bold">
            {question}
          </h1>

          {error && (
            <div
              role="alert"
              className="border-danger/30 bg-danger/5 text-kiosk-body text-danger mb-6 flex items-center justify-between gap-4 rounded-2xl border-2 p-5 font-bold"
            >
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-kiosk-label underline"
                aria-label="오류 메시지 닫기"
              >
                닫기
              </button>
            </div>
          )}

          {children}
        </main>

        {showHelp && (
          <footer className="border-line border-t-2 bg-[#eef1f4] px-6 py-5 lg:px-10">
            <button
              onClick={() => navigate('/kiosk/help')}
              className="bg-warning text-kiosk-body h-touch text-ink w-full border-2 border-[#9a6b00] font-bold transition-colors hover:bg-[#e6b51e] active:scale-[0.99]"
            >
              잘 모르겠어요 · 직원 도움 요청
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
