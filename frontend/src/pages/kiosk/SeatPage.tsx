import { KioskLayout } from '@/components/KioskLayout'
import { EmptyView } from '@/components/StatusView'
import { OCCUPIED_SEATS, seatLayout } from '@/mocks/data'
import { useKioskSession } from '@/session/kioskSessionContext'
import type { BusGrade } from '@/types/session'

/**
 * 좌석 선택 — 데모에서 사용자가 "막히는" 지점.
 */
export default function SeatPage() {
  const { session, patch, isLoading } = useKioskSession()
  const busGrade = session?.busGrade

  async function selectSeat(seatNo: string) {
    const updated = await patch({ seatNo, currentStep: 'CONFIRMATION' })
    if (!updated) return
  }

  return (
    <KioskLayout step="SEAT_SELECTION" question="어느 자리에 앉으시겠어요?">
      {!busGrade ? (
        <EmptyView message="시간과 버스 종류를 먼저 선택해 주세요." />
      ) : (
        <>
          <p className="text-kiosk-body text-muted mb-6">
            {session?.departureTime} · {busGrade === 'PREMIUM' ? '우등' : '일반'}
          </p>
          <p className="text-kiosk-label text-muted mb-6">
            회색 좌석은 이미 선택되었습니다. 원하는 좌석을 눌러 주세요.
          </p>

          <SeatGrid
            busGrade={busGrade}
            selectedSeat={session?.seatNo}
            disabled={isLoading}
            onSelect={selectSeat}
          />

          {session?.seatNo && (
            <p className="text-kiosk-body text-success mt-8 text-center font-bold" role="status">
              ✓ {session.seatNo}번 좌석을 선택했어요.
            </p>
          )}
        </>
      )}
    </KioskLayout>
  )
}

function SeatGrid({
  busGrade,
  selectedSeat,
  disabled,
  onSelect,
}: {
  busGrade: BusGrade
  selectedSeat: string | null | undefined
  disabled: boolean
  onSelect: (seatNo: string) => void
}) {
  const layout = seatLayout(busGrade)

  return (
    <div className="bg-surface border-line rounded-3xl border-2 p-5 sm:p-8">
      <div className="text-kiosk-label text-muted mb-6 text-center">앞쪽</div>
      <div className="space-y-3">
        {Array.from({ length: layout.rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-3">
            <span className="text-kiosk-label text-muted w-7 text-center">{rowIndex + 1}</span>
            <div
              className={`grid flex-1 gap-3 ${layout.seatsPerRow === 3 ? 'grid-cols-[1fr_1fr_1fr]' : 'grid-cols-4'}`}
            >
              {Array.from({ length: layout.seatsPerRow }, (_, seatIndex) => {
                const seatNo = String(rowIndex * layout.seatsPerRow + seatIndex + 1)
                const isOccupied = OCCUPIED_SEATS.includes(seatNo)
                const isSelected = selectedSeat === seatNo

                return (
                  <button
                    key={seatNo}
                    type="button"
                    disabled={disabled || isOccupied}
                    onClick={() => onSelect(seatNo)}
                    aria-pressed={isSelected}
                    aria-label={`${seatNo}번 좌석${isOccupied ? ', 선택 불가' : ''}`}
                    className={`text-kiosk-label min-h-14 rounded-xl border-2 font-bold transition-colors active:scale-[0.98] disabled:cursor-not-allowed ${
                      isOccupied
                        ? 'bg-surface-muted border-line text-muted'
                        : isSelected
                          ? 'bg-brand border-brand text-white'
                          : 'border-line bg-surface hover:border-brand text-ink'
                    }`}
                  >
                    {seatNo}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
