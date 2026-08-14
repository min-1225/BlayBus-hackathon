import { KioskLayout } from '@/components/KioskLayout'
import { useKioskSession } from '@/session/kioskSessionContext'

/**
 * 좌석 선택 — 데모에서 사용자가 "막히는" 지점.
 *
 * TODO(Frontend A):
 *   seatLayout(session.busGrade) 로 배치를 구하고 OCCUPIED_SEATS 는 선택 불가로 표시
 *   선택 시 patch({ seatNo, currentStep: 'CONFIRMATION' })
 *
 * 데모 시나리오에서는 사용자가 여기서 좌석을 고르지 않고 하단 도움받기를 누른다.
 * 따라서 이 화면에서 도움 버튼이 항상 보이는지 반드시 확인할 것.
 *
 * 참고 구현: DestinationPage.tsx
 */
export default function SeatPage() {
  const { session } = useKioskSession()

  return (
    <KioskLayout step="SEAT_SELECTION" question="어느 자리에 앉으시겠어요?">
      <p className="text-kiosk-body text-muted">
        {session?.departureTime ?? '시간 미선택'} ·{' '}
        {session?.busGrade === 'PREMIUM' ? '우등' : '일반'} 좌석 배치도를 구현하세요.
      </p>
    </KioskLayout>
  )
}
