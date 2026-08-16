import { useNavigate } from 'react-router'
import type { ReactNode } from 'react'
import { StepIndicator } from './StepIndicator'
import { BookingSummary } from './BookingSummary'
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
    <div className="bg-surface-muted min-h-dvh">
      <div className="mx-auto min-h-dvh max-w-7xl">
        <header className="bg-surface border-line border-b px-6 py-5 lg:px-10">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-kiosk-label text-brand-strong font-bold tracking-wide">
              KIOBRIDGE BUS
            </p>
            <p className="text-kiosk-label text-muted">고속버스 예매</p>
          </div>
          <StepIndicator current={step} />
        </header>

        <main className="grid w-full gap-5 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-10 lg:py-8">
          <section className="bg-surface border-line rounded-lg border p-6 lg:p-8">
            <h1 className="text-kiosk-title mb-8 font-bold break-keep">{question}</h1>

            {error && (
              <div
                role="alert"
                className="bg-surface border-line text-kiosk-body text-ink mb-6 flex items-center justify-between gap-4 rounded-lg border p-5"
              >
                <span>
                  <strong className="text-danger">오류</strong> · {error}
                </span>
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

            {showHelp && (
              <footer className="border-line mt-8 border-t pt-6">
                <button
                  onClick={() => navigate('/kiosk/help')}
                  className="bg-brand text-kiosk-body h-touch hover:bg-brand-strong w-full font-bold text-white transition-colors active:scale-[0.99]"
                >
                  직원 도움 요청
                </button>
              </footer>
            )}
          </section>
          <BookingSummary />
        </main>
      </div>
    </div>
  )
}
