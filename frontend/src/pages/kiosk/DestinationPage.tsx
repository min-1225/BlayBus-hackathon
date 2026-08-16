import { useNavigate } from 'react-router'
import { KioskLayout } from '@/components/KioskLayout'
import { DESTINATIONS } from '@/mocks/data'
import { useKioskSession } from '@/session/kioskSessionContext'

/**
 * 목적지 선택 — 다른 Kiosk 화면의 참고 구현.
 *
 * 이 화면이 보여주는 패턴 4가지:
 *   1. KioskLayout 으로 감싸고 step 을 넘긴다
 *   2. 서버 저장은 patch() 한 번으로 끝낸다 (fetch 직접 호출 금지)
 *   3. isLoading 동안 버튼을 비활성화한다
 *   4. patch 실패 시 다음 화면으로 넘어가지 않는다 (오류는 KioskLayout 이 표시)
 */
export default function DestinationPage() {
  const navigate = useNavigate()
  const { patch, isLoading } = useKioskSession()

  async function selectDestination(destination: string) {
    const updated = await patch({ destination, currentStep: 'DATE' })
    if (updated) navigate('/kiosk/date')
  }

  return (
    <KioskLayout step="DESTINATION" question="출발지와 도착지를 선택하세요">
      <div className="border-brand-soft bg-brand-soft mb-6 flex items-center justify-between rounded-lg border px-5 py-4">
        <div>
          <p className="text-kiosk-label text-muted">출발</p>
          <p className="text-kiosk-body font-bold">동서울</p>
        </div>
        <span className="text-brand text-kiosk-title" aria-hidden>
          →
        </span>
        <div className="text-right">
          <p className="text-kiosk-label text-muted">도착</p>
          <p className="text-kiosk-body text-muted">선택해 주세요</p>
        </div>
      </div>

      <p className="text-kiosk-label text-muted mb-4">도착지를 눌러 다음 단계로 이동합니다.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DESTINATIONS.map((destination) => (
          <button
            key={destination}
            onClick={() => selectDestination(destination)}
            disabled={isLoading}
            className="bg-surface border-line text-kiosk-body h-touch hover:border-brand rounded-lg border font-bold transition-colors active:scale-[0.98] disabled:opacity-40"
          >
            {destination}
          </button>
        ))}
      </div>
    </KioskLayout>
  )
}
