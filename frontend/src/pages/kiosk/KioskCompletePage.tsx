import { useNavigate } from 'react-router'
import { BigButton } from '@/components/BigButton'
import { KioskLayout } from '@/components/KioskLayout'
import { useKioskSession } from '@/session/kioskSessionContext'

/**
 * 예매 완료 — 데모의 마지막 화면.
 *
 * TODO(Frontend A): 티켓 형태로 다듬기(출발/도착/날짜/시간/좌석/등급).
 * 지금은 완료 상태가 화면에 반영되는지 확인할 수 있는 최소 구현이다.
 */
export default function KioskCompletePage() {
  const navigate = useNavigate()
  const { session, reset } = useKioskSession()

  function startOver() {
    reset()
    navigate('/kiosk', { replace: true })
  }

  return (
    <KioskLayout step="COMPLETED" question="예매가 완료되었습니다" showHelp={false}>
      <div className="bg-surface border-line mb-8 rounded-lg border p-8">
        <p className="text-kiosk-title text-success mb-6 text-center font-bold">발권 완료</p>

        <dl className="divide-line divide-y">
          <Row label="출발" value={session?.departure} />
          <Row label="도착" value={session?.destination} />
          <Row label="날짜" value={session?.travelDate} />
          <Row label="시간" value={session?.departureTime} />
          <Row label="버스" value={session?.busGrade === 'PREMIUM' ? '우등' : '일반'} />
          <Row label="좌석" value={session?.seatNo ? `${session.seatNo}번` : null} />
        </dl>
      </div>

      <BigButton variant="secondary" onClick={startOver}>
        처음으로
      </BigButton>
    </KioskLayout>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <dt className="text-kiosk-body text-muted">{label}</dt>
      <dd className="text-kiosk-body font-bold">{value ?? '-'}</dd>
    </div>
  )
}
