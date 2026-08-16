/**
 * docs/API_CONTRACT.md 와 1:1로 대응하는 타입.
 *
 * Backend Enum 과 철자가 반드시 같아야 한다.
 * Contract 가 바뀌면 이 파일을 먼저 고치고, 컴파일 에러가 나는 지점을 따라가며 수정한다.
 */

export type SessionStatus = 'ACTIVE' | 'WAITING' | 'CLAIMED' | 'COMPLETED'

export type BookingStep =
  'DESTINATION' | 'DATE' | 'SCHEDULE' | 'SEAT_SELECTION' | 'CONFIRMATION' | 'PAYMENT' | 'COMPLETED'

export type BusGrade = 'STANDARD' | 'PREMIUM'

export interface Session {
  id: number
  status: SessionStatus
  currentStep: BookingStep
  departure: string
  destination: string | null
  travelDate: string | null
  departureTime: string | null
  busGrade: BusGrade | null
  seatNo: string | null
  transferCode: string | null
  createdAt?: string
  updatedAt?: string
}

/** PATCH /sessions/{id} 로 보낼 수 있는 필드. */
export type SessionPatch = Partial<
  Pick<
    Session,
    'currentStep' | 'destination' | 'travelDate' | 'departureTime' | 'busGrade' | 'seatNo'
  >
>

export interface TransferResponse {
  sessionId: number
  code: string
  expiresAt: string
}

export interface ApiErrorResponse {
  code: string
  message: string
}

export type SessionEventType = 'SESSION_CLAIMED' | 'SESSION_UPDATED' | 'SESSION_COMPLETED'

export interface SessionEvent {
  type: SessionEventType
  sessionId: number
  occurredAt: string
}

/** 화면에 순서대로 표시할 단계. Easy Mode 의 진행 표시에 사용한다. */
export const STEP_SEQUENCE: BookingStep[] = [
  'DESTINATION',
  'DATE',
  'SCHEDULE',
  'SEAT_SELECTION',
  'CONFIRMATION',
  'PAYMENT',
]

export const STEP_LABEL: Record<BookingStep, string> = {
  DESTINATION: '노선',
  DATE: '날짜',
  SCHEDULE: '시간',
  SEAT_SELECTION: '좌석',
  CONFIRMATION: '직원 도움',
  PAYMENT: '완료 대기',
  COMPLETED: '완료',
}
