package com.kiobridge.backend.session.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.kiobridge.backend.session.BookingStep;
import com.kiobridge.backend.session.BusGrade;
import com.kiobridge.backend.session.OrderSession;
import com.kiobridge.backend.session.SessionStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 세션 응답. Frontend 의 {@code Session} 타입(src/types/session.ts)과 필드명·형식이 1:1 대응한다.
 *
 * 내부 관리 필드인 {@code transferExpiresAt} 은 노출하지 않는다.
 * departureTime 은 "HH:mm", travelDate 는 "yyyy-MM-dd" 로 직렬화한다.
 */
public record SessionResponse(
        Long id,
        SessionStatus status,
        BookingStep currentStep,
        String departure,
        String destination,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate travelDate,
        @JsonFormat(pattern = "HH:mm") LocalTime departureTime,
        BusGrade busGrade,
        String seatNo,
        String transferCode,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static SessionResponse from(OrderSession session) {
        return new SessionResponse(
                session.getId(),
                session.getStatus(),
                session.getCurrentStep(),
                session.getDeparture(),
                session.getDestination(),
                session.getTravelDate(),
                session.getDepartureTime(),
                session.getBusGrade(),
                session.getSeatNo(),
                session.getTransferCode(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }
}
