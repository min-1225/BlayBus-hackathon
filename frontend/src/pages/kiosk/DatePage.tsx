import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { KioskLayout } from '@/components/KioskLayout'
import { useKioskSession } from '@/session/kioskSessionContext'
import { createDateOptions } from '@/utils/dateOptions'

/**
 * 날짜 선택.
 */
export default function DatePage() {
  const navigate = useNavigate()
  const { session, patch, isLoading } = useKioskSession()
  const dates = useMemo(() => createDateOptions(), [])

  async function selectDate(value: string) {
    const updated = await patch({ travelDate: value, currentStep: 'SCHEDULE' })
    if (updated) navigate('/kiosk/schedule')
  }

  return (
    <KioskLayout step="DATE" question="출발 날짜를 선택하세요">
      <p className="text-kiosk-body text-muted mb-6">
        {session?.destination ?? '목적지를 먼저 선택해 주세요'}행
      </p>

      {/* deslop-ignore-next-line 28 -- 날짜 선택지는 동일한 중요도의 실제 선택 목록이다. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dates.map((date) => {
          const isSelected = session?.travelDate === date.value

          return (
            <button
              key={date.value}
              type="button"
              onClick={() => selectDate(date.value)}
              disabled={isLoading || !session?.destination}
              aria-pressed={isSelected}
              data-testid="date-option"
              className={`min-h-touch rounded-lg border px-5 py-3 text-left font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? 'bg-brand border-brand text-white'
                  : 'bg-surface border-line hover:border-brand text-ink'
              }`}
            >
              <span className="text-kiosk-body block leading-tight">{date.label}</span>
              <span
                className={`text-kiosk-label mt-1 block whitespace-nowrap ${isSelected ? 'text-white/80' : 'text-muted'}`}
              >
                {date.value}
              </span>
            </button>
          )
        })}
      </div>
    </KioskLayout>
  )
}
