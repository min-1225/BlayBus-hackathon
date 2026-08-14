package com.kiobridge.backend.session.dto;

import java.time.LocalDateTime;

/**
 * POST /api/v1/sessions/{id}/transfer 응답. Frontend 의 {@code TransferResponse} 타입과 1:1 대응한다.
 * {@code expiresAt} 은 세션 내부 필드 {@code transferExpiresAt} 을 그대로 반환한 값이다.
 */
public record TransferResponse(
        Long sessionId,
        String code,
        LocalDateTime expiresAt
) {
}
