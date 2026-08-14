import { KioskLayout } from '@/components/KioskLayout'
import { useKioskSession } from '@/session/kioskSessionContext'

/**
 * 날짜 선택.
 *
 * TODO(Frontend A): 오늘부터 7일치를 큰 버튼으로 보여주고
 *   await patch({ travelDate: 'YYYY-MM-DD', currentStep: 'SCHEDULE' })
 *   성공하면 navigate('/kiosk/schedule')
 *
 * 참고 구현: DestinationPage.tsx
 */
export default function DatePage() {
  const { session } = useKioskSession()

  return (
    <KioskLayout step="DATE" question="언제 출발하시나요?">
      <p className="text-kiosk-body text-muted">
        {session?.destination ?? '목적지 미선택'} 행 · 날짜 선택 화면을 구현하세요.
      </p>
    </KioskLayout>
  )
}
