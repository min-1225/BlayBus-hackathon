package com.kiobridge.backend.websocket;

import java.time.LocalDateTime;

/**
 * 세션 변경 신호. Frontend(src/types/session.ts 의 SessionEvent)와 필드가 1:1 대응한다.
 *
 * 전체 Session 데이터를 담지 않고 "무엇이 바뀌었다"는 신호만 전달한다.
 * Frontend 는 이 이벤트를 받은 뒤 GET /api/v1/sessions/{id} 로 최신 상태를 다시 조회한다.
 *
 * 이 record 는 Spring ApplicationEvent(서비스 → 리스너)와 WS 전송 payload 로 함께 쓰인다.
 */
public record SessionEvent(
        SessionEventType type,
        Long sessionId,
        LocalDateTime occurredAt
) {

    public static SessionEvent of(SessionEventType type, Long sessionId, LocalDateTime occurredAt) {
        return new SessionEvent(type, sessionId, occurredAt);
    }

    /** WS 발행 대상 Topic: /topic/sessions/{sessionId} */
    public String destination() {
        return "/topic/sessions/" + sessionId;
    }
}
