import { useState } from 'react'
import { useParams } from 'react-router'
import { StaffLayout } from './StaffLayout'
import { claimSession } from '@/api/sessionApi'
import { toUserMessage } from '@/api/http'
import { BigButton } from '@/components/BigButton'
import { ErrorView, LoadingView } from '@/components/StatusView'
import { useSessionQuery } from '@/hooks/useSessionQuery'
import { STEP_LABEL } from '@/types/session'

/**
 * 이어받은 예매 상세 — 직원이 남은 항목을 채우는 화면.
 *
 * Claim 이후의 좌석 수정과 완료 처리는 별도 기능에서 추가한다.
 */
export default function SessionDetailPage() {
  const { sessionId } = useParams()
  const { session, setSession, error, setError, isLoading, reload } = useSessionQuery(
    Number(sessionId),
  )
  const [isClaiming, setIsClaiming] = useState(false)

  async function claim() {
    if (!session || isClaiming) return

    setIsClaiming(true)
    setError(null)

    try {
      setSession(await claimSession(session.id))
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setIsClaiming(false)
    }
  }

  if (isLoading) {
    return (
      <StaffLayout title="예매 정보">
        <LoadingView />
      </StaffLayout>
    )
  }

  if (error || !session) {
    return (
      <StaffLayout title="예매 정보">
        <ErrorView message={error ?? '예매 정보를 찾을 수 없습니다.'} onRetry={reload} />
      </StaffLayout>
    )
  }

  const missing = [
    !session.destination && '목적지',
    !session.travelDate && '날짜',
    !session.departureTime && '시간',
    !session.seatNo && '좌석',
  ].filter(Boolean) as string[]

  return (
    <StaffLayout
      title={`${session.departure} → ${session.destination ?? '미정'}`}
      subtitle={`현재 단계: ${STEP_LABEL[session.currentStep]} · 상태: ${session.status}`}
    >
      <dl className="bg-surface border-line divide-line mb-6 divide-y rounded-2xl border-2">
        <Row label="날짜" value={session.travelDate} />
        <Row label="시간" value={session.departureTime} />
        <Row label="버스" value={session.busGrade === 'PREMIUM' ? '우등' : '일반'} />
        <Row label="좌석" value={session.seatNo} />
      </dl>

      {missing.length > 0 && (
        <p className="bg-warning/15 text-kiosk-label mb-6 rounded-2xl px-5 py-4 font-bold">
          미완료 항목: {missing.join(', ')}
        </p>
      )}

      {session.status === 'WAITING' && (
        <BigButton onClick={claim} disabled={isClaiming}>
          {isClaiming ? '이어받는 중...' : '이 예매 이어받기'}
        </BigButton>
      )}

      {session.status === 'CLAIMED' && (
        <p className="bg-success/15 text-success rounded-2xl px-5 py-4 font-bold">
          이 예매를 이어받았습니다. 좌석 수정과 완료 처리는 다음 단계에서 진행합니다.
        </p>
      )}
    </StaffLayout>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-bold">{value ?? <span className="text-danger">미입력</span>}</dd>
    </div>
  )
}
