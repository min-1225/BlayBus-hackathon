import { useCallback, useEffect, useState } from 'react'
import { toUserMessage } from '@/api/http'
import { getSession } from '@/api/sessionApi'
import type { Session } from '@/types/session'

/**
 * Staff 화면에서 세션 하나를 불러오는 공용 Hook.
 *
 * Loading / Error / 재조회 / 경쟁 상태(race condition) 처리를 한 곳에 모았다.
 * 직원 화면을 새로 만들 때 이 Hook 을 쓰면 세 상태 처리를 다시 짜지 않아도 된다.
 *
 * setSession 을 함께 돌려주므로, claim/update/complete 응답으로 받은 최신 세션을
 * 서버에 다시 묻지 않고 바로 반영할 수 있다.
 */
export function useSessionQuery(sessionId: number | undefined) {
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 이 값이 바뀌면 아래 useEffect 가 다시 돌면서 재조회한다.
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (sessionId === undefined || Number.isNaN(sessionId)) return

    // 응답이 늦게 도착한 이전 요청이 최신 상태를 덮어쓰지 않도록 막는다.
    let cancelled = false

    getSession(sessionId)
      .then((loaded) => {
        if (cancelled) return
        setSession(loaded)
        setError(null)
      })
      .catch((caught: unknown) => {
        if (cancelled) return
        setError(toUserMessage(caught))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sessionId, reloadToken])

  const reload = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setReloadToken((token) => token + 1)
  }, [])

  return { session, setSession, error, setError, isLoading, reload }
}
