import type { SessionEvent } from '@/types/session'

/**
 * Mock 모드의 실시간 채널.
 *
 * 실제 Backend 가 붙으면 STOMP(/topic/sessions/{id}) 가 이 역할을 한다.
 * Mock 모드에서는 BroadcastChannel 로 같은 Origin 의 다른 탭에 이벤트를 보낸다.
 * 덕분에 Backend 없이도 "직원이 완료 → 키오스크 화면이 자동 전환"을 확인할 수 있다.
 */

const CHANNEL_NAME = 'kiobridge:mock:events'

export function publishMockEvent(event: SessionEvent): void {
  const channel = new BroadcastChannel(CHANNEL_NAME)
  channel.postMessage(event)
  channel.close()
}

export function subscribeMockEvents(
  sessionId: number,
  onEvent: (event: SessionEvent) => void,
): () => void {
  const channel = new BroadcastChannel(CHANNEL_NAME)

  channel.onmessage = (message: MessageEvent<SessionEvent>) => {
    if (message.data.sessionId === sessionId) {
      onEvent(message.data)
    }
  }

  return () => channel.close()
}
