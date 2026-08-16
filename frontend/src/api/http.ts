import { API_BASE_URL } from '@/config/env'
import type { ApiErrorResponse } from '@/types/session'

/**
 * 모든 REST 호출이 지나가는 지점.
 *
 * 페이지 컴포넌트는 fetch 를 직접 부르지 않는다. api/*Api.ts 만 이 파일을 쓴다.
 * URL 하드코딩 금지 규칙(docs/FRONTEND_GUIDE.md §3)을 코드로 강제하기 위한 구조다.
 */

export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(response: ApiErrorResponse, status: number) {
    super(response.message)
    this.name = 'ApiError'
    this.code = response.code
    this.status = status
  }
}

/** 사용자에게 그대로 보여줘도 되는 한국어 메시지. 화면마다 문구를 새로 짓지 않는다. */
const ERROR_MESSAGE: Record<string, string> = {
  SESSION_NOT_FOUND: '예매 정보를 찾을 수 없습니다.',
  TRANSFER_CODE_NOT_FOUND: '해당 번호의 예매를 찾을 수 없습니다. 번호를 다시 확인해 주세요.',
  TRANSFER_CODE_EXPIRED: '이어하기 번호가 만료되었습니다. 키오스크에서 다시 발급해 주세요.',
  INVALID_SESSION_STATUS: '지금은 처리할 수 없는 상태입니다.',
  VALIDATION_ERROR: '입력값을 다시 확인해 주세요.',
  NETWORK_ERROR: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGE[error.code] ?? error.message ?? ERROR_MESSAGE.UNKNOWN_ERROR
  }
  return ERROR_MESSAGE.UNKNOWN_ERROR
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    // 서버가 꺼져 있거나 네트워크가 끊긴 경우 — 화면이 ApiError 하나만 처리하면 되도록 변환한다.
    throw new ApiError({ code: 'NETWORK_ERROR', message: ERROR_MESSAGE.NETWORK_ERROR }, 0)
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null
    throw new ApiError(
      body ?? { code: 'UNKNOWN_ERROR', message: `Request failed: ${res.status}` },
      res.status,
    )
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) })
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
}
