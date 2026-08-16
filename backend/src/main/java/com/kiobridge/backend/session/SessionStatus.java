package com.kiobridge.backend.session;

/**
 * 세션 생명주기. 철자는 Frontend(src/types/session.ts)와 완전히 동일해야 한다.
 */
public enum SessionStatus {
    ACTIVE,
    WAITING,
    CLAIMED,
    COMPLETED
}
