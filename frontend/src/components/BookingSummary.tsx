import { SCHEDULES } from '@/mocks/data'
import { useKioskSession } from '@/session/kioskSessionContext'

/**
 * 예매 과정 내내 보여 주는 요약 패널.
 *
 * 선택 값을 새로 저장하지 않고 현재 Session만 읽는다. 따라서 Mock/실서버 모두에서
 * 같은 화면을 쓸 수 있다.
 */
export function BookingSummary() {
  const { session } = useKioskSession()
  const schedule = session?.destination
    ? SCHEDULES[session.destination]?.find(
        (item) =>
          item.departureTime === session.departureTime && item.busGrade === session.busGrade,
      )
    : undefined

  const departureAt = [formatDate(session?.travelDate), session?.departureTime]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className="bg-surface border-line h-fit rounded-xl border p-6 lg:sticky lg:top-6">
      <h2 className="text-kiosk-body mb-6 font-bold">예매 요약</h2>
      <dl className="text-kiosk-label divide-line divide-y">
        <SummaryRow label="출발" value={session?.departure ?? '동서울'} />
        <SummaryRow label="도착" value={session?.destination} />
        <SummaryRow label="출발 일시" value={departureAt || null} />
        <SummaryRow
          label="버스"
          value={session?.busGrade ? (session.busGrade === 'PREMIUM' ? '우등' : '일반') : null}
        />
        <SummaryRow label="좌석" value={session?.seatNo ? `${session.seatNo}번` : null} />
      </dl>
      <div className="border-line mt-5 border-t pt-5">
        <p className="text-kiosk-label text-muted">예상 요금</p>
        <p className="text-kiosk-body mt-1 font-bold">
          {schedule ? `${schedule.fareWon.toLocaleString('ko-KR')}원` : '-'}
        </p>
      </div>
      <p className="text-kiosk-label text-muted mt-6 leading-6">
        도움이 필요하면 아래 버튼을 누르세요. 지금까지의 선택은 안전하게 저장됩니다.
      </p>
    </aside>
  )
}

function SummaryRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">{value ?? '미선택'}</dd>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return null

  const [year, month, day] = value.split('-')
  return `${year}.${month}.${day}`
}
