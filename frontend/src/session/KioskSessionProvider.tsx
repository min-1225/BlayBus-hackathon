import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { toUserMessage } from '@/api/http'
import {
  completeSession,
  createSession,
  createTransfer,
  getSession,
  updateSession,
} from '@/api/sessionApi'
import { KIOSK_DEPARTURE } from '@/config/env'
import { KioskSessionContext, type KioskSessionValue } from './kioskSessionContext'
import type { Session, SessionPatch, TransferResponse } from '@/types/session'

/**
 * 키오스크 예매 상태를 앱 전체에 제공한다.
 *
 * 화면 컴포넌트는 fetch 나 sessionId 를 직접 다루지 않고
 * useKioskSession() 의 start / patch / requestTransfer 만 호출한다.
 */

/** 새로고침해도 진행 상황을 잃지 않도록 sessionId 를 저장해 둔다. */
const SESSION_ID_KEY = 'kiobridge:kiosk:sessionId'

interface State {
  session: Session | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'REQUEST_START' }
  | { type: 'REQUEST_SUCCESS'; session: Session }
  | { type: 'REQUEST_FAILURE'; error: string }
  | { type: 'REQUEST_DONE' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' }

const initialState: State = { session: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'REQUEST_START':
      return { ...state, isLoading: true, error: null }
    case 'REQUEST_SUCCESS':
      return { session: action.session, isLoading: false, error: null }
    case 'REQUEST_FAILURE':
      return { ...state, isLoading: false, error: action.error }
    case 'REQUEST_DONE':
      return { ...state, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'RESET':
      return initialState
  }
}

export function KioskSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  /** 새로고침 복구 — 저장된 sessionId 가 있으면 서버에서 다시 읽어온다. */
  useEffect(() => {
    const savedId = sessionStorage.getItem(SESSION_ID_KEY)
    if (!savedId) return

    let cancelled = false
    dispatch({ type: 'REQUEST_START' })

    getSession(Number(savedId))
      .then((session) => {
        if (!cancelled) dispatch({ type: 'REQUEST_SUCCESS', session })
      })
      .catch(() => {
        // 서버에 없는 세션이면 조용히 버린다. 사용자에게 보여줄 오류가 아니다.
        sessionStorage.removeItem(SESSION_ID_KEY)
        if (!cancelled) dispatch({ type: 'REQUEST_DONE' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  /** 모든 서버 호출의 공통 처리 — 로딩 표시, 오류 문구 변환, 상태 갱신. */
  const run = useCallback(
    async <T,>(
      task: () => Promise<T>,
      extractSession: (result: T) => Session | null,
    ): Promise<T | null> => {
      dispatch({ type: 'REQUEST_START' })

      try {
        const result = await task()
        const session = extractSession(result)

        if (session) {
          sessionStorage.setItem(SESSION_ID_KEY, String(session.id))
          dispatch({ type: 'REQUEST_SUCCESS', session })
        } else {
          dispatch({ type: 'REQUEST_DONE' })
        }

        return result
      } catch (error) {
        dispatch({ type: 'REQUEST_FAILURE', error: toUserMessage(error) })
        return null
      }
    },
    [],
  )

  const start = useCallback(async () => {
    if (state.session) return state.session
    return run(
      () => createSession(KIOSK_DEPARTURE),
      (s) => s,
    )
  }, [run, state.session])

  const patch = useCallback(
    async (patchBody: SessionPatch) => {
      // 세션이 아직 없으면 먼저 만든다. 화면에서 순서를 신경 쓰지 않아도 되게 한다.
      const current =
        state.session ??
        (await run(
          () => createSession(KIOSK_DEPARTURE),
          (s) => s,
        ))
      if (!current) return null

      return run(
        () => updateSession(current.id, patchBody),
        (s) => s,
      )
    },
    [run, state.session],
  )

  const requestTransfer = useCallback(async (): Promise<TransferResponse | null> => {
    const current = state.session
    if (!current) return null

    const transfer = await run(
      () => createTransfer(current.id),
      () => null,
    )
    if (!transfer) return null

    // transfer 응답에는 Session 전체가 없으므로 최신 상태를 다시 읽는다.
    await run(
      () => getSession(current.id),
      (s) => s,
    )
    return transfer
  }, [run, state.session])

  const refresh = useCallback(async () => {
    const current = state.session
    if (!current) return null
    return run(
      () => getSession(current.id),
      (s) => s,
    )
  }, [run, state.session])

  const completeBooking = useCallback(async () => {
    const current = state.session
    if (!current) return null
    return run(
      () => completeSession(current.id),
      (session) => session,
    )
  }, [run, state.session])

  const reset = useCallback(() => {
    sessionStorage.removeItem(SESSION_ID_KEY)
    dispatch({ type: 'RESET' })
  }, [])

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [])

  const value = useMemo<KioskSessionValue>(
    () => ({
      session: state.session,
      isLoading: state.isLoading,
      error: state.error,
      start,
      patch,
      requestTransfer,
      completeBooking,
      refresh,
      reset,
      clearError,
    }),
    [state, start, patch, requestTransfer, completeBooking, refresh, reset, clearError],
  )

  return <KioskSessionContext value={value}>{children}</KioskSessionContext>
}
