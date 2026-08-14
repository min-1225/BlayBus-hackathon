import { apiGet, apiPatch, apiPost } from './http'
import type { ScheduleOption } from '@/mocks/data'
import type { Session, SessionPatch, TransferResponse } from '@/types/session'

/**
 * docs/API_CONTRACT.md 의 REST 엔드포인트를 그대로 감싼다.
 * 화면은 이 함수들만 호출한다. URL 문자열은 이 파일 밖으로 나가지 않는다.
 */

/** POST /api/v1/sessions */
export function createSession(departure: string): Promise<Session> {
  return apiPost<Session>('/api/v1/sessions', { departure })
}

/** GET /api/v1/sessions/{sessionId} */
export function getSession(sessionId: number): Promise<Session> {
  return apiGet<Session>(`/api/v1/sessions/${sessionId}`)
}

/** PATCH /api/v1/sessions/{sessionId} */
export function updateSession(sessionId: number, patch: SessionPatch): Promise<Session> {
  return apiPatch<Session>(`/api/v1/sessions/${sessionId}`, patch)
}

/** POST /api/v1/sessions/{sessionId}/transfer — ACTIVE → WAITING */
export function createTransfer(sessionId: number): Promise<TransferResponse> {
  return apiPost<TransferResponse>(`/api/v1/sessions/${sessionId}/transfer`)
}

/** GET /api/v1/transfers/{code} */
export function getSessionByTransferCode(code: string): Promise<Session> {
  return apiGet<Session>(`/api/v1/transfers/${code}`)
}

/** POST /api/v1/sessions/{sessionId}/claim — WAITING → CLAIMED */
export function claimSession(sessionId: number): Promise<Session> {
  return apiPost<Session>(`/api/v1/sessions/${sessionId}/claim`)
}

/** POST /api/v1/sessions/{sessionId}/complete — CLAIMED → COMPLETED */
export function completeSession(sessionId: number): Promise<Session> {
  return apiPost<Session>(`/api/v1/sessions/${sessionId}/complete`)
}

/**
 * GET /api/v1/schedules?destination=
 *
 * Contract 에 없는 Frontend 전용 조회다.
 * Backend 가 제공하지 않기로 하면 mocks/data.ts 를 직접 import 하는 방식으로 바꾼다.
 */
export function getSchedules(destination: string): Promise<ScheduleOption[]> {
  return apiGet<ScheduleOption[]>(
    `/api/v1/schedules?destination=${encodeURIComponent(destination)}`,
  )
}
