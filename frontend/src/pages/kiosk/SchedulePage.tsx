import { KioskLayout } from '@/components/KioskLayout'
import { useKioskSession } from '@/session/kioskSessionContext'

/**
 * 출발 시간 / 버스 등급 선택.
 *
 * TODO(Frontend A):
 *   getSchedules(session.destination) 으로 시간표를 불러온다
 *   출발시간 / 버스종류 / 남은좌석 을 시각적으로 분리해서 보여준다 (FRONTEND_GUIDE §7)
 *   선택 시 patch({ departureTime, busGrade, currentStep: 'SEAT_SELECTION' })
 *   남은 좌석 0 인 편은 선택 불가로 표시한다
 *
 * 참고 구현: DestinationPage.tsx
 */
export default function SchedulePage() {
  const { session } = useKioskSession()

  return (
    <KioskLayout step="SCHEDULE" question="몇 시 버스를 타시나요?">
      <p className="text-kiosk-body text-muted">
        {session?.destination ?? '목적지 미선택'} · {session?.travelDate ?? '날짜 미선택'} 시간표를
        구현하세요.
      </p>
    </KioskLayout>
  )
}
