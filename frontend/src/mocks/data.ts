import type { BusGrade } from '@/types/session'

/** 데모 시나리오: 동서울 출발. */
export const DESTINATIONS = ['강릉', '속초', '춘천', '원주', '안동', '전주'] as const

export interface ScheduleOption {
  id: string
  departureTime: string
  busGrade: BusGrade
  fareWon: number
  remainingSeats: number
}

/** 목적지별 시간표. 데모 시나리오의 "11:30 우등"이 강릉에 포함되어야 한다. */
export const SCHEDULES: Record<string, ScheduleOption[]> = {
  강릉: [
    {
      id: 'gn-0900',
      departureTime: '09:00',
      busGrade: 'STANDARD',
      fareWon: 15400,
      remainingSeats: 12,
    },
    {
      id: 'gn-1030',
      departureTime: '10:30',
      busGrade: 'STANDARD',
      fareWon: 15400,
      remainingSeats: 3,
    },
    {
      id: 'gn-1130',
      departureTime: '11:30',
      busGrade: 'PREMIUM',
      fareWon: 22500,
      remainingSeats: 8,
    },
    {
      id: 'gn-1400',
      departureTime: '14:00',
      busGrade: 'PREMIUM',
      fareWon: 22500,
      remainingSeats: 21,
    },
    {
      id: 'gn-1730',
      departureTime: '17:30',
      busGrade: 'STANDARD',
      fareWon: 15400,
      remainingSeats: 0,
    },
  ],
  속초: [
    {
      id: 'sc-0930',
      departureTime: '09:30',
      busGrade: 'STANDARD',
      fareWon: 17800,
      remainingSeats: 9,
    },
    {
      id: 'sc-1300',
      departureTime: '13:00',
      busGrade: 'PREMIUM',
      fareWon: 25900,
      remainingSeats: 14,
    },
  ],
  춘천: [
    {
      id: 'cc-0820',
      departureTime: '08:20',
      busGrade: 'STANDARD',
      fareWon: 8600,
      remainingSeats: 18,
    },
    {
      id: 'cc-1215',
      departureTime: '12:15',
      busGrade: 'STANDARD',
      fareWon: 8600,
      remainingSeats: 6,
    },
  ],
  원주: [
    {
      id: 'wj-1000',
      departureTime: '10:00',
      busGrade: 'STANDARD',
      fareWon: 9800,
      remainingSeats: 22,
    },
    {
      id: 'wj-1530',
      departureTime: '15:30',
      busGrade: 'PREMIUM',
      fareWon: 14200,
      remainingSeats: 11,
    },
  ],
  안동: [
    {
      id: 'ad-1100',
      departureTime: '11:00',
      busGrade: 'PREMIUM',
      fareWon: 28400,
      remainingSeats: 7,
    },
  ],
  전주: [
    {
      id: 'jj-0940',
      departureTime: '09:40',
      busGrade: 'PREMIUM',
      fareWon: 26100,
      remainingSeats: 15,
    },
    {
      id: 'jj-1620',
      departureTime: '16:20',
      busGrade: 'STANDARD',
      fareWon: 19300,
      remainingSeats: 4,
    },
  ],
}

/** 좌석 배치. 우등(PREMIUM)은 1열 3석, 일반(STANDARD)은 1열 4석. */
export function seatLayout(busGrade: BusGrade) {
  return busGrade === 'PREMIUM' ? { rows: 9, seatsPerRow: 3 } : { rows: 11, seatsPerRow: 4 }
}

/** 데모에서 "이미 팔린 좌석"으로 보여줄 번호. */
export const OCCUPIED_SEATS = ['3', '4', '8', '12', '15', '16', '21']

/** 버스 등급에 맞는 좌석 중 판매 완료 좌석을 제외한 선택 가능 번호. */
export function availableSeatNumbers(busGrade: BusGrade): string[] {
  const layout = seatLayout(busGrade)
  const seatCount = layout.rows * layout.seatsPerRow

  return Array.from({ length: seatCount }, (_, index) => String(index + 1)).filter(
    (seatNo) => !OCCUPIED_SEATS.includes(seatNo),
  )
}
