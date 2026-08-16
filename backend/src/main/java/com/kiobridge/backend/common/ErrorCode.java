package com.kiobridge.backend.common;

import org.springframework.http.HttpStatus;

/**
 * API 오류 코드와 HTTP 상태의 매핑. 문자열은 Frontend(src/api/http.ts)의 ERROR_MESSAGE 키와 동일해야 한다.
 */
public enum ErrorCode {
    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "세션을 찾을 수 없습니다."),
    TRANSFER_CODE_NOT_FOUND(HttpStatus.NOT_FOUND, "이어하기 코드를 찾을 수 없습니다."),
    TRANSFER_CODE_EXPIRED(HttpStatus.NOT_FOUND, "이어하기 번호가 만료되었습니다."),
    INVALID_SESSION_STATUS(HttpStatus.CONFLICT, "지금은 처리할 수 없는 상태입니다."),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "입력값을 다시 확인해 주세요.");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
