package com.kiobridge.backend.session;

import com.kiobridge.backend.session.dto.CreateSessionRequest;
import com.kiobridge.backend.session.dto.SessionResponse;
import com.kiobridge.backend.session.dto.TransferResponse;
import com.kiobridge.backend.session.dto.UpdateSessionRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 세션 REST API. URL·메서드·JSON 형식은 docs/API_CONTRACT.md 및 Frontend(src/api/sessionApi.ts)와 일치한다.
 */
@RestController
@RequestMapping("/api/v1")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    /** POST /api/v1/sessions — 세션 생성(ACTIVE / DESTINATION). */
    @PostMapping("/sessions")
    public ResponseEntity<SessionResponse> create(@Valid @RequestBody CreateSessionRequest request) {
        OrderSession session = sessionService.create(request.getDeparture());
        return ResponseEntity.status(HttpStatus.CREATED).body(SessionResponse.from(session));
    }

    /** GET /api/v1/sessions/{sessionId} — 세션 단건 조회. */
    @GetMapping("/sessions/{sessionId}")
    public SessionResponse get(@PathVariable Long sessionId) {
        return SessionResponse.from(sessionService.get(sessionId));
    }

    /** PATCH /api/v1/sessions/{sessionId} — 전달된 필드만 수정. */
    @PatchMapping("/sessions/{sessionId}")
    public SessionResponse update(@PathVariable Long sessionId,
                                  @RequestBody UpdateSessionRequest request) {
        return SessionResponse.from(sessionService.update(sessionId, request));
    }

    /** POST /api/v1/sessions/{sessionId}/transfer — 이어하기 코드 발급(ACTIVE → WAITING). */
    @PostMapping("/sessions/{sessionId}/transfer")
    public TransferResponse transfer(@PathVariable Long sessionId) {
        return sessionService.issueTransfer(sessionId);
    }

    /** GET /api/v1/transfers/{code} — 코드로 세션 조회. */
    @GetMapping("/transfers/{code}")
    public SessionResponse findByTransferCode(@PathVariable String code) {
        return SessionResponse.from(sessionService.getByTransferCode(code));
    }

    /** POST /api/v1/sessions/{sessionId}/claim — 직원 이어받기(WAITING → CLAIMED). */
    @PostMapping("/sessions/{sessionId}/claim")
    public SessionResponse claim(@PathVariable Long sessionId) {
        return SessionResponse.from(sessionService.claim(sessionId));
    }

    /** POST /api/v1/sessions/{sessionId}/complete — 직원 완료(CLAIMED → COMPLETED). */
    @PostMapping("/sessions/{sessionId}/complete")
    public SessionResponse complete(@PathVariable Long sessionId) {
        return SessionResponse.from(sessionService.complete(sessionId));
    }
}
