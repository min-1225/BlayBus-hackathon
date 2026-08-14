package com.kiobridge.backend.common;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Spring/JPA 의 기본 오류 HTML 이나 Stack Trace 대신 일관된 JSON({@link ApiErrorResponse})을 반환한다.
 *
 * - 도메인 규칙 위반({@link ApiException})은 담긴 코드/메시지 그대로 변환한다.
 * - Bean Validation 실패, 잘못된 Enum/타입, 깨진 JSON 은 모두 VALIDATION_ERROR(400) 로 변환한다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException ex) {
        ErrorCode code = ex.getErrorCode();
        return ResponseEntity
                .status(code.getStatus())
                .body(new ApiErrorResponse(code.name(), ex.getMessage()));
    }

    /** {@code @Valid} 로 검증한 요청 본문이 제약을 위반한 경우. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse(ErrorCode.VALIDATION_ERROR.getDefaultMessage());
        return validationError(message);
    }

    /** 잘못된 Enum 값이나 파싱 불가능한 날짜/시간 등 JSON 본문 자체를 읽지 못한 경우. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        return validationError(ErrorCode.VALIDATION_ERROR.getDefaultMessage());
    }

    /** Path/Query 변수의 타입이 맞지 않는 경우(예: 숫자 자리에 문자). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return validationError(ErrorCode.VALIDATION_ERROR.getDefaultMessage());
    }

    private ResponseEntity<ApiErrorResponse> validationError(String message) {
        return ResponseEntity
                .status(ErrorCode.VALIDATION_ERROR.getStatus())
                .body(new ApiErrorResponse(ErrorCode.VALIDATION_ERROR.name(), message));
    }
}
