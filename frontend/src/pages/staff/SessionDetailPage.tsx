import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { StaffLayout } from './StaffLayout'
import { claimSession, completeSession, updateSession } from '@/api/sessionApi'
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
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { session, setSession, error, setError, isLoading, reload } = useSessionQuery(
    Number(sessionId),
  )
  const [isClaiming, setIsClaiming] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  async function saveSeat(formData: FormData) {
    if (!session) return
    const seatNo = String(formData.get('seatNo') ?? '').trim()
    if (!seatNo) {
      setError('좌석 번호를 입력해 주세요.')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      setSession(await updateSession(session.id, { seatNo }))
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setIsSaving(false)
    }
  }

  async function complete() {
    if (!session || isSaving) return
    setIsSaving(true)
    setError(null)
    try {
      await completeSession(session.id)
      navigate(`/staff/sessions/${session.id}/complete`)
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setIsSaving(false)
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
        <div className="space-y-4">
          <form
            action={saveSeat}
            className="bg-surface border-line space-y-3 rounded-2xl border-2 p-5"
          >
            <label htmlFor="seat-no" className="block font-bold">
              좌석 번호
            </label>
            <input
              id="seat-no"
              name="seatNo"
              defaultValue={session.seatNo ?? ''}
              inputMode="numeric"
              className="border-line w-full rounded-xl border-2 px-4 py-3 text-xl font-bold"
            />
            <BigButton type="submit" variant="secondary" disabled={isSaving}>
              좌석 저장
            </BigButton>
          </form>
          <BigButton onClick={complete} disabled={isSaving || !session.seatNo}>
            예매 완료 처리
          </BigButton>
        </div>
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
