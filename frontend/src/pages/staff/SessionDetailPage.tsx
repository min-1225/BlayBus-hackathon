import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { StaffLayout } from './StaffLayout'
import { claimSession, completeSession, updateSession } from '@/api/sessionApi'
import { toUserMessage } from '@/api/http'
import { BigButton } from '@/components/BigButton'
import { ErrorView, LoadingView } from '@/components/StatusView'
import { useSessionQuery } from '@/hooks/useSessionQuery'
import { SCHEDULES } from '@/mocks/data'
import { STEP_LABEL, type BusGrade } from '@/types/session'

/**
 * 이어받은 예매 상세 — 직원이 남은 항목을 채우는 화면.
 *
 * Claim 이후 고객이 고르지 못한 날짜·시간표·좌석을 직원이 채우고 완료한다.
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

  async function saveBookingDetails(formData: FormData) {
    if (!session) return
    const travelDate = String(formData.get('travelDate') ?? '').trim()
    const schedule = String(formData.get('schedule') ?? '').trim()
    const seatNo = String(formData.get('seatNo') ?? '').trim()
    const [departureTime, busGradeValue] = schedule.split('|')
    const busGrade = busGradeValue as BusGrade

    if (!travelDate || !departureTime || !['STANDARD', 'PREMIUM'].includes(busGrade) || !seatNo) {
      setError('날짜, 출발 시간, 버스, 좌석을 모두 입력해 주세요.')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      setSession(
        await updateSession(session.id, {
          travelDate,
          departureTime,
          busGrade,
          seatNo,
          currentStep: 'CONFIRMATION',
        }),
      )
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setIsSaving(false)
    }
  }

  async function complete() {
    if (!session || isSaving) return
    if (missing.length > 0) {
      setError(`미완료 항목을 먼저 입력해 주세요: ${missing.join(', ')}`)
      return
    }
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
    !session.busGrade && '버스',
    !session.seatNo && '좌석',
  ].filter(Boolean) as string[]
  const scheduleOptions = session.destination ? (SCHEDULES[session.destination] ?? []) : []
  const selectedSchedule =
    session.departureTime && session.busGrade ? `${session.departureTime}|${session.busGrade}` : ''

  return (
    <StaffLayout
      title={`${session.departure} → ${session.destination ?? '미정'}`}
      subtitle={`현재 단계: ${STEP_LABEL[session.currentStep]} · 상태: ${session.status}`}
    >
      <dl className="bg-surface border-line divide-line mb-6 divide-y rounded-lg border">
        <Row label="날짜" value={session.travelDate} />
        <Row label="시간" value={session.departureTime} />
        <Row
          label="버스"
          value={session.busGrade ? (session.busGrade === 'PREMIUM' ? '우등' : '일반') : undefined}
        />
        <Row label="좌석" value={session.seatNo} />
      </dl>

      {missing.length > 0 && (
        <p className="bg-surface border-line text-kiosk-label mb-6 rounded-lg border px-5 py-4">
          <strong>미완료 항목</strong> · {missing.join(', ')}
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
            action={saveBookingDetails}
            className="bg-surface border-line space-y-3 rounded-lg border p-5"
          >
            <label htmlFor="travel-date" className="block font-bold">
              출발 날짜
            </label>
            <input
              id="travel-date"
              name="travelDate"
              type="date"
              required
              defaultValue={session.travelDate ?? ''}
              className="border-line w-full rounded-lg border px-4 py-3 text-xl font-bold"
            />

            <label htmlFor="schedule" className="block font-bold">
              출발 시간과 버스
            </label>
            <select
              id="schedule"
              name="schedule"
              required
              defaultValue={selectedSchedule}
              className="border-line bg-surface w-full rounded-lg border px-4 py-3 text-xl font-bold"
            >
              <option value="">시간과 버스를 선택하세요</option>
              {scheduleOptions.map((schedule) => (
                <option
                  key={schedule.id}
                  value={`${schedule.departureTime}|${schedule.busGrade}`}
                  disabled={schedule.remainingSeats === 0}
                >
                  {schedule.departureTime} · {schedule.busGrade === 'PREMIUM' ? '우등' : '일반'} ·
                  잔여 {schedule.remainingSeats}석
                </option>
              ))}
            </select>

            <label htmlFor="seat-no" className="block font-bold">
              좌석 번호
            </label>
            <input
              id="seat-no"
              name="seatNo"
              defaultValue={session.seatNo ?? ''}
              inputMode="numeric"
              className="border-line w-full rounded-lg border px-4 py-3 text-xl font-bold"
            />
            <BigButton type="submit" variant="secondary" disabled={isSaving}>
              예매 정보 저장
            </BigButton>
          </form>
          <BigButton onClick={complete} disabled={isSaving || missing.length > 0}>
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
