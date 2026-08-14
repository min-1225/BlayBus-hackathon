package com.kiobridge.backend.websocket;

/**
 * WebSocket 이벤트 종류. 철자는 Frontend(src/types/session.ts 의 SessionEventType)와 완전히 동일해야 한다.
 */
public enum SessionEventType {
    SESSION_CLAIMED,
    SESSION_UPDATED,
    SESSION_COMPLETED
}
