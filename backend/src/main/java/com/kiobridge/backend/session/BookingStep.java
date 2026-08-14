package com.kiobridge.backend.session;

/**
 * 예매 진행 단계. 철자는 Frontend(src/types/session.ts)와 완전히 동일해야 한다.
 */
public enum BookingStep {
    DESTINATION,
    DATE,
    SCHEDULE,
    SEAT_SELECTION,
    CONFIRMATION,
    PAYMENT,
    COMPLETED
}
