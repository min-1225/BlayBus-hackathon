import { HttpResponse, http, delay } from 'msw'
import { publishMockEvent } from './realtime'
import {
  findSession,
  findSessionByCode,
  insertSession,
  issueTransferCode,
  saveSession,
} from './store'
import { SCHEDULES } from './data'
import type { Session, SessionEvent } from '@/types/session'

/**
 * 가짜 Backend.
 *
 * docs/API_CONTRACT.md 를 그대로 구현한다.
 * Contract 가 바뀌면 이 파일도 같이 바꿔야 Frontend 가 잘못된 가정을 하지 않는다.
 *
 * 상태 전이도 실제 서버와 동일하게 강제한다(ACTIVE → WAITING → CLAIMED → COMPLETED).
 * 그래야 Backend 연동 시 "Mock 에서는 됐는데 실서버에서 409" 같은 상황이 생기지 않는다.
 */

/** 실제 네트워크처럼 보이도록 약간의 지연을 준다. Loading UI 를 검증하기 위함. */
const LATENCY_MS = 250

/** Transfer Code 유효시간 — Backend 기본 권장값과 동일하게 15분. */
const TRANSFER_TTL_MS = 15 * 60 * 1000

function errorResponse(status: number, code: string, message: string) {
  return HttpResponse.json({ code, message }, { status })
}

function notFound() {
  return errorResponse(404, 'SESSION_NOT_FOUND', '세션을 찾을 수 없습니다.')
}

function emit(type: SessionEvent['type'], sessionId: number) {
  publishMockEvent({ type, sessionId, occurredAt: new Date().toISOString().slice(0, 19) })
}

type UpdatableField =
  'currentStep' | 'destination' | 'travelDate' | 'departureTime' | 'busGrade' | 'seatNo'

const UPDATABLE_FIELDS: UpdatableField[] = [
  'currentStep',
  'destination',
  'travelDate',
  'departureTime',
  'busGrade',
  'seatNo',
]

export const handlers = [
  /** 시간표 조회 — Contract 에는 없는 Frontend 전용 Mock. Backend 연동 시 정적 데이터로 대체한다. */
  http.get('/api/v1/schedules', async ({ request }) => {
    await delay(LATENCY_MS)
    const destination = new URL(request.url).searchParams.get('destination') ?? ''
    return HttpResponse.json(SCHEDULES[destination] ?? [])
  }),

  /** POST /api/v1/sessions */
  http.post('/api/v1/sessions', async ({ request }) => {
    await delay(LATENCY_MS)
    const body = (await request.json()) as { departure?: string }

    if (!body?.departure) {
      return errorResponse(400, 'VALIDATION_ERROR', 'departure 는 필수입니다.')
    }

    return HttpResponse.json(insertSession(body.departure), { status: 201 })
  }),

  /** GET /api/v1/sessions/{sessionId} */
  http.get('/api/v1/sessions/:sessionId', async ({ params }) => {
    await delay(LATENCY_MS)
    const session = findSession(Number(params.sessionId))
    return session ? HttpResponse.json(session) : notFound()
  }),

  /** PATCH /api/v1/sessions/{sessionId} */
  http.patch('/api/v1/sessions/:sessionId', async ({ params, request }) => {
    await delay(LATENCY_MS)
    const session = findSession(Number(params.sessionId))
    if (!session) return notFound()

    if (session.status === 'COMPLETED') {
      return errorResponse(409, 'INVALID_SESSION_STATUS', '이미 완료된 예매입니다.')
    }

    const patch = (await request.json()) as Partial<Session>
    const next = { ...session }

    for (const field of UPDATABLE_FIELDS) {
      if (field in patch) {
        // Contract 상 모든 필드가 optional 이므로 전달된 것만 반영한다.
        Object.assign(next, { [field]: patch[field] })
      }
    }

    const saved = saveSession(next)
    emit('SESSION_UPDATED', saved.id)
    return HttpResponse.json(saved)
  }),

  /** POST /api/v1/sessions/{sessionId}/transfer — ACTIVE → WAITING */
  http.post('/api/v1/sessions/:sessionId/transfer', async ({ params }) => {
    await delay(LATENCY_MS)
    const session = findSession(Number(params.sessionId))
    if (!session) return notFound()

    if (session.status === 'COMPLETED') {
      return errorResponse(409, 'INVALID_SESSION_STATUS', '이미 완료된 예매입니다.')
    }

    // 이미 코드를 받은 세션이 다시 요청하면 같은 코드를 돌려준다(중복 발급 방지).
    const code = session.transferCode ?? issueTransferCode()
    const saved = saveSession({ ...session, status: 'WAITING', transferCode: code })

    return HttpResponse.json({
      sessionId: saved.id,
      code,
      expiresAt: new Date(Date.now() + TRANSFER_TTL_MS).toISOString().slice(0, 19),
    })
  }),

  /** GET /api/v1/transfers/{code} */
  http.get('/api/v1/transfers/:code', async ({ params }) => {
    await delay(LATENCY_MS)
    const session = findSessionByCode(String(params.code))

    if (!session) {
      return errorResponse(404, 'TRANSFER_CODE_NOT_FOUND', '이어하기 코드를 찾을 수 없습니다.')
    }

    return HttpResponse.json(session)
  }),

  /** POST /api/v1/sessions/{sessionId}/claim — WAITING → CLAIMED */
  http.post('/api/v1/sessions/:sessionId/claim', async ({ params }) => {
    await delay(LATENCY_MS)
    const session = findSession(Number(params.sessionId))
    if (!session) return notFound()

    if (session.status === 'CLAIMED') {
      return errorResponse(409, 'INVALID_SESSION_STATUS', '이미 다른 직원이 이어받은 예매입니다.')
    }

    if (session.status !== 'WAITING') {
      return errorResponse(409, 'INVALID_SESSION_STATUS', '이어받을 수 있는 상태가 아닙니다.')
    }

    const saved = saveSession({ ...session, status: 'CLAIMED' })
    emit('SESSION_CLAIMED', saved.id)
    return HttpResponse.json(saved)
  }),

  /** POST /api/v1/sessions/{sessionId}/complete — 고객 직접 완료 또는 직원 완료 */
  http.post('/api/v1/sessions/:sessionId/complete', async ({ params }) => {
    await delay(LATENCY_MS)
    const session = findSession(Number(params.sessionId))
    if (!session) return notFound()

    if (session.status !== 'ACTIVE' && session.status !== 'CLAIMED') {
      return errorResponse(409, 'INVALID_SESSION_STATUS', '완료할 수 있는 상태가 아닙니다.')
    }

    if (!session.seatNo) {
      return errorResponse(400, 'VALIDATION_ERROR', '좌석을 먼저 선택해야 합니다.')
    }

    const saved = saveSession({ ...session, status: 'COMPLETED', currentStep: 'COMPLETED' })
    emit('SESSION_COMPLETED', saved.id)
    return HttpResponse.json(saved)
  }),
]
