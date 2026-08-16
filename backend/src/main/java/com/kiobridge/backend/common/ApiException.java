package com.kiobridge.backend.common;

/**
 * 도메인 규칙 위반을 표현하는 예외. {@link com.kiobridge.backend.common.GlobalExceptionHandler}
 * 가 이를 일관된 JSON({@link ApiErrorResponse})으로 변환한다.
 */
public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;

    public ApiException(ErrorCode errorCode) {
        this(errorCode, errorCode.getDefaultMessage());
    }

    public ApiException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
