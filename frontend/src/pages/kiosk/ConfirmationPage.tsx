import { useNavigate } from 'react-router'
import { BigButton } from '@/components/BigButton'
import { KioskLayout } from '@/components/KioskLayout'
import { EmptyView } from '@/components/StatusView'
import { useKioskSession } from '@/session/kioskSessionContext'

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const { session, patch, isLoading } = useKioskSession()

  async function continueToPayment() {
    const updated = await patch({ currentStep: 'PAYMENT' })
    if (updated) navigate('/kiosk/payment')
  }

  if (!session?.seatNo) {
    return (
      <KioskLayout step="CONFIRMATION" question="예매 내용을 확인하세요">
        <EmptyView message="좌석을 먼저 선택해 주세요." />
      </KioskLayout>
    )
  }

  return (
    <KioskLayout step="CONFIRMATION" question="예매 내용을 확인하세요">
      <dl className="bg-surface-muted border-line mb-8 divide-y rounded-xl border">
        <Row label="구간" value={`${session.departure} → ${session.destination}`} />
        <Row label="출발 일시" value={`${session.travelDate} ${session.departureTime}`} />
        <Row label="버스" value={session.busGrade === 'PREMIUM' ? '우등' : '일반'} />
        <Row label="좌석" value={`${session.seatNo}번`} />
      </dl>

      <div className="grid gap-3 sm:grid-cols-2">
        <BigButton variant="secondary" onClick={() => navigate('/kiosk/seat')} disabled={isLoading}>
          좌석 다시 선택
        </BigButton>
        <BigButton onClick={continueToPayment} disabled={isLoading}>
          결제하기
        </BigButton>
      </div>
    </KioskLayout>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 px-5 py-5">
      <dt className="text-kiosk-body text-muted">{label}</dt>
      <dd className="text-kiosk-body text-right font-bold">{value}</dd>
    </div>
  )
}
