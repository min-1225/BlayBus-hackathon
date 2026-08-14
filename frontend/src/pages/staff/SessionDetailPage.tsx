import { useParams } from 'react-router'
import { StaffLayout } from './StaffLayout'
import { ErrorView, LoadingView } from '@/components/StatusView'
import { useSessionQuery } from '@/hooks/useSessionQuery'
import { STEP_LABEL } from '@/types/session'

/**
 * 이어받은 예매 상세 — 직원이 남은 항목을 채우는 화면.
 *
 * TODO(Frontend B):
 *   1. "이어받기" 버튼 → claimSession(id) 로 WAITING → CLAIMED
 *      성공 응답을 setSession 으로 그대로 반영하면 재조회가 필요 없다
 *      409 가 오면 setError 로 "이미 다른 직원이 이어받았습니다" 를 보여준다
 *   2. 좌석 등 미완료 항목 입력 → updateSession(id, patch) → setSession(응답)
 *   3. "예매 완료" → completeSession(id) 후 /staff/sessions/:id/complete 로 이동
 *
 * 조회 / 로딩 / 오류 / 재시도는 useSessionQuery 가 이미 처리한다.
 * 참고 구현: TransferLookupPage.tsx
 */
export default function SessionDetailPage() {
  const { sessionId } = useParams()
  const { session, error, isLoading, reload } = useSessionQuery(Number(sessionId))

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

      <p className="text-muted">이어받기 · 수정 · 완료 버튼을 이 아래에 구현하세요.</p>
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
