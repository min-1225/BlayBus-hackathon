import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { KioskLayout } from '@/components/KioskLayout'
import { LoadingView } from '@/components/StatusView'
import { subscribeSession } from '@/api/websocket'
import { useKioskSession } from '@/session/kioskSessionContext'

/**
 * 이어하기 번호 안내 + 직원의 완료를 기다리는 화면.
 *
 * WebSocket 구독의 참고 구현이다. 핵심 규칙 두 가지:
 *   1. subscribeSession 은 항상 "구독 해제 함수"를 돌려준다 → useEffect cleanup 에 그대로 반환
 *   2. 이벤트는 "무언가 바뀌었다"는 신호일 뿐이므로, 실제 데이터는 refresh() 로 다시 읽는다
 *
 * Mock 모드에서도 그대로 동작한다(BroadcastChannel). Backend 연동 시 고칠 코드가 없다.
 */
export default function TransferPage() {
  const navigate = useNavigate()
  const { session, refresh } = useKioskSession()

  const sessionId = session?.id

  useEffect(() => {
    if (!sessionId) return

    return subscribeSession(sessionId, (event) => {
      if (event.type === 'SESSION_COMPLETED') {
        void refresh().then(() => navigate('/kiosk/complete'))
      }
    })
  }, [sessionId, refresh, navigate])

  if (!session?.transferCode) {
    return (
      <KioskLayout
        step={session?.currentStep ?? 'DESTINATION'}
        question="번호를 발급하고 있어요"
        showHelp={false}
      >
        <LoadingView message="잠시만 기다려 주세요" />
      </KioskLayout>
    )
  }

  return (
    <KioskLayout
      step={session.currentStep}
      question="직원에게 이 번호를 알려주세요"
      showHelp={false}
    >
      <div className="border-brand mb-8 border-y-4 bg-[#f4f6f8] py-10 text-center">
        <p className="text-kiosk-label text-muted mb-3">이어하기 번호</p>
        <p className="text-kiosk-code text-brand-strong font-bold tracking-[0.15em] tabular-nums">
          {session.transferCode}
        </p>
      </div>

      <div className="text-kiosk-body space-y-3 text-center">
        <p className="font-bold">고르신 내용은 그대로 저장되어 있어요.</p>
        <p className="text-muted">직원이 도와드리면 이 화면이 자동으로 바뀝니다.</p>
      </div>

      <div
        className="mt-10 flex items-center justify-center gap-3"
        role="status"
        aria-live="polite"
      >
        <span className="bg-success size-2" />
        <span className="text-kiosk-label text-muted">직원 연결을 기다리는 중</span>
      </div>
    </KioskLayout>
  )
}
