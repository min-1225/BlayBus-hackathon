import { Client } from '@stomp/stompjs'
import { USE_MOCK, WS_BASE_URL } from '@/config/env'
import { subscribeMockEvents } from '@/mocks/realtime'
import type { SessionEvent } from '@/types/session'

/**
 * Session 실시간 이벤트 구독.
 *
 * Mock 모드에서는 BroadcastChannel, 실서버에서는 STOMP 를 쓰지만
 * 호출하는 쪽 코드는 완전히 동일하다. Backend 연동 시 화면을 고칠 필요가 없다.
 *
 * 반환값은 항상 "구독 해제 함수"다. useEffect 의 cleanup 에 그대로 넘기면 된다.
 */
export function subscribeSession(
  sessionId: number,
  onEvent: (event: SessionEvent) => void,
): () => void {
  if (USE_MOCK) {
    return subscribeMockEvents(sessionId, onEvent)
  }

  const client = new Client({
    brokerURL: buildBrokerUrl(),
    reconnectDelay: 3000,
    onConnect: () => {
      client.subscribe(`/topic/sessions/${sessionId}`, (message) => {
        onEvent(JSON.parse(message.body) as SessionEvent)
      })
    },
  })

  client.activate()
  return () => {
    void client.deactivate()
  }
}

/**
 * ws:// 또는 wss:// 주소를 만든다.
 *
 * WS_BASE_URL 이 비어 있으면 현재 접속한 Origin 을 쓴다.
 * 배포 환경(HTTPS)에서는 반드시 wss:// 여야 하므로 http→ws, https→wss 로 변환한다.
 */
function buildBrokerUrl(): string {
  const base = WS_BASE_URL || window.location.origin
  return `${base.replace(/^http/, 'ws')}/ws`
}
