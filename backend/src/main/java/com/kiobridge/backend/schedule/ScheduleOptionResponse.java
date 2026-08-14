package com.kiobridge.backend.schedule;

import com.kiobridge.backend.session.BusGrade;

/**
 * 시간표 항목. Frontend 의 {@code ScheduleOption}(src/mocks/data.ts)과 필드명·타입이 1:1 대응한다.
 */
public record ScheduleOptionResponse(
        String id,
        String departureTime,
        BusGrade busGrade,
        int fareWon,
        int remainingSeats
) {
}
