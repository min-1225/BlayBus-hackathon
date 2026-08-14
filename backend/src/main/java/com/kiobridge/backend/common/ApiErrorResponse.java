package com.kiobridge.backend.common;

/**
 * 모든 오류 응답의 공통 형식.
 *
 * <pre>
 * { "code": "INVALID_SESSION_STATUS", "message": "이어받을 수 있는 상태가 아닙니다." }
 * </pre>
 */
public record ApiErrorResponse(String code, String message) {

    public static ApiErrorResponse of(ErrorCode code, String message) {
        return new ApiErrorResponse(code.name(), message);
    }
}
