import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BigButton } from '@/components/BigButton'
import { KioskLayout } from '@/components/KioskLayout'
import { EmptyView } from '@/components/StatusView'
import { SCHEDULES } from '@/mocks/data'
import { useKioskSession } from '@/session/kioskSessionContext'

const PAYMENT_METHODS = ['신용/체크카드', '간편결제', '계좌이체'] as const

export default function PaymentPage() {
  const navigate = useNavigate()
  const { session, completeBooking, isLoading } = useKioskSession()
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number] | null>(null)

  const schedule = session?.destination
    ? SCHEDULES[session.destination]?.find(
        (item) =>
          item.departureTime === session.departureTime && item.busGrade === session.busGrade,
      )
    : null

  async function pay() {
    if (!method) return
    const completed = await completeBooking()
    if (completed) navigate('/kiosk/complete', { replace: true })
  }

  if (!session?.seatNo) {
    return (
      <KioskLayout step="PAYMENT" question="결제 수단을 선택하세요">
        <EmptyView message="예매 정보를 먼저 선택해 주세요." />
      </KioskLayout>
    )
  }

  return (
    <KioskLayout step="PAYMENT" question="결제 수단을 선택하세요">
      <div className="grid gap-3 sm:grid-cols-3">
        {PAYMENT_METHODS.map((paymentMethod) => (
          <button
            key={paymentMethod}
            type="button"
            onClick={() => setMethod(paymentMethod)}
            aria-pressed={method === paymentMethod}
            className={`text-kiosk-body h-touch-lg rounded-lg border-2 px-4 font-bold transition-colors ${
              method === paymentMethod
                ? 'border-brand bg-brand text-white'
                : 'bg-surface border-line hover:border-brand'
            }`}
          >
            {paymentMethod}
          </button>
        ))}
      </div>

      <div className="border-line my-8 flex items-center justify-between border-y py-6">
        <span className="text-kiosk-body text-muted">총 결제금액</span>
        <strong className="text-kiosk-title">
          {schedule?.fareWon.toLocaleString('ko-KR') ?? '-'}원
        </strong>
      </div>

      <p className="text-kiosk-label text-muted mb-6">
        MVP 시연 화면이며 실제 금액은 결제되지 않습니다.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <BigButton
          variant="secondary"
          onClick={() => navigate('/kiosk/confirm')}
          disabled={isLoading}
        >
          이전
        </BigButton>
        <BigButton onClick={pay} disabled={!method || isLoading}>
          {isLoading ? '처리 중...' : '결제 완료'}
        </BigButton>
      </div>
    </KioskLayout>
  )
}
