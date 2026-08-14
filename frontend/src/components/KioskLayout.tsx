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
    <div className="flex min-h-dvh flex-col">
      <header className="bg-surface border-line border-b px-8 py-5">
        <StepIndicator current={step} />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-10">
        <h1 className="text-kiosk-title mb-8 font-bold">{question}</h1>

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
        <footer className="bg-surface border-line sticky bottom-0 border-t px-8 py-5">
          <button
            onClick={() => navigate('/kiosk/help')}
            className="bg-warning text-kiosk-body h-touch text-ink w-full rounded-2xl font-bold active:scale-[0.98]"
          >
            잘 모르겠어요 · 도움받기
          </button>
        </footer>
      )}
    </div>
  )
}
