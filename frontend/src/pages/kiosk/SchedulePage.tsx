import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { KioskLayout } from '@/components/KioskLayout'
import { ErrorView, LoadingView, EmptyView } from '@/components/StatusView'
import { getSchedules } from '@/api/sessionApi'
import { toUserMessage } from '@/api/http'
import type { ScheduleOption } from '@/mocks/data'
import { useKioskSession } from '@/session/kioskSessionContext'

/**
 * 출발 시간 / 버스 등급 선택.
 */
export default function SchedulePage() {
  const navigate = useNavigate()
  const { session, patch, isLoading: isSaving } = useKioskSession()
  const [schedules, setSchedules] = useState<ScheduleOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const destination = session?.destination
  const travelDate = session?.travelDate

  useEffect(() => {
    if (!destination || !travelDate) {
      return
    }

    let cancelled = false

    getSchedules(destination)
      .then((loaded) => {
        if (!cancelled) setSchedules(loaded)
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(toUserMessage(caught))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [destination, travelDate])

  async function selectSchedule(schedule: ScheduleOption) {
    if (schedule.remainingSeats === 0) return

    const updated = await patch({
      departureTime: schedule.departureTime,
      busGrade: schedule.busGrade,
      currentStep: 'SEAT_SELECTION',
    })
    if (updated) navigate('/kiosk/seat')
  }

  return (
    <KioskLayout step="SCHEDULE" question="출발 시간을 선택하세요">
      {!destination || !travelDate ? (
        <EmptyView message="목적지와 날짜를 먼저 선택해 주세요." />
      ) : isLoading ? (
        <LoadingView message="버스 시간을 불러오는 중입니다" />
      ) : error ? (
        <ErrorView message={error} />
      ) : schedules.length === 0 ? (
        <EmptyView message="선택할 수 있는 버스가 없습니다." />
      ) : (
        <div className="space-y-3">
          <p className="text-kiosk-body text-muted">
            {destination} · {travelDate}
          </p>

          {schedules.map((schedule) => {
            const isSoldOut = schedule.remainingSeats === 0
            const isSelected =
              session.departureTime === schedule.departureTime &&
              session.busGrade === schedule.busGrade

            return (
              <button
                key={schedule.id}
                type="button"
                onClick={() => selectSchedule(schedule)}
                disabled={isSoldOut || isSaving}
                aria-pressed={isSelected}
                className={`w-full rounded-lg border p-5 text-left transition-colors active:scale-[0.98] disabled:cursor-not-allowed ${
                  isSoldOut
                    ? 'bg-surface-muted border-line text-muted opacity-60'
                    : isSelected
                      ? 'bg-brand border-brand text-white'
                      : 'bg-surface border-line hover:border-brand text-ink'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-kiosk-title font-bold">{schedule.departureTime}</span>
                  <span className="text-kiosk-body font-bold">
                    {isSoldOut ? '매진' : `${schedule.remainingSeats}석 남음`}
                  </span>
                </div>
                <div
                  className={`text-kiosk-label mt-2 flex justify-between ${isSelected ? 'text-white/80' : 'text-muted'}`}
                >
                  <span>{schedule.busGrade === 'PREMIUM' ? '우등' : '일반'}</span>
                  <span>{schedule.fareWon.toLocaleString('ko-KR')}원</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </KioskLayout>
  )
}
