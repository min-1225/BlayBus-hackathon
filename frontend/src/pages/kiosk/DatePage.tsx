import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { KioskLayout } from '@/components/KioskLayout'
import { useKioskSession } from '@/session/kioskSessionContext'

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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {dates.map((date) => {
          const isSelected = session?.travelDate === date.value

          return (
            <button
              key={date.value}
              type="button"
              onClick={() => selectDate(date.value)}
              disabled={isLoading || !session?.destination}
              aria-pressed={isSelected}
              className={`h-touch rounded-lg border px-5 text-left font-bold transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? 'bg-brand border-brand text-white'
                  : 'bg-surface border-line hover:border-brand text-ink'
              }`}
            >
              <span className="text-kiosk-body block">{date.label}</span>
              <span
                className={`text-kiosk-label mt-1 block ${isSelected ? 'text-white/80' : 'text-muted'}`}
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

interface DateOption {
  value: string
  label: string
}

function createDateOptions(): DateOption[] {
  const weekday = ['일', '월', '화', '수', '목', '금', '토']
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)

    const value = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
    const relativeLabel = offset === 0 ? '오늘' : offset === 1 ? '내일' : ''
    const calendarLabel = `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday[date.getDay()]})`

    return { value, label: relativeLabel ? `${relativeLabel} · ${calendarLabel}` : calendarLabel }
  })
}
