package com.kiobridge.backend.session;

import com.kiobridge.backend.common.ApiException;
import com.kiobridge.backend.common.ErrorCode;
import com.kiobridge.backend.session.dto.TransferResponse;
import com.kiobridge.backend.session.dto.UpdateSessionRequest;
import com.kiobridge.backend.websocket.SessionEvent;
import com.kiobridge.backend.websocket.SessionEventType;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * KioBridge 세션의 도메인 로직.
 *
 * 기본 CRUD 는 {@link SessionRepository}(Spring Data JPA)가 담당하고, 이 클래스는
 * 상태 전이 검증 · Transfer Code 발급/만료 정책 · 완료 조건 검증 같은 도메인 규칙만 다룬다.
 */
@Service
public class SessionService {

    /** Transfer Code 기본 유효 시간(15분). */
    private static final Duration TRANSFER_TTL = Duration.ofMinutes(15);

    private static final SecureRandom RANDOM = new SecureRandom();

    private final SessionRepository sessionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    public SessionService(SessionRepository sessionRepository,
                          ApplicationEventPublisher eventPublisher,
                          Clock clock) {
        this.sessionRepository = sessionRepository;
        this.eventPublisher = eventPublisher;
        this.clock = clock;
    }

    @Transactional
    public OrderSession create(String departure) {
        OrderSession session = OrderSession.createActive(departure, now());
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public OrderSession get(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.SESSION_NOT_FOUND));
    }

    /** 전달된(=null 이 아닌) 필드만 반영한다. COMPLETED 세션은 수정할 수 없다. */
    @Transactional
    public OrderSession update(Long sessionId, UpdateSessionRequest request) {
        OrderSession session = get(sessionId);

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new ApiException(ErrorCode.INVALID_SESSION_STATUS, "이미 완료된 예매는 수정할 수 없습니다.");
        }

        if (request.getCurrentStep() != null) {
            session.setCurrentStep(request.getCurrentStep());
        }
        if (request.getDestination() != null) {
            session.setDestination(request.getDestination());
        }
        if (request.getTravelDate() != null) {
            session.setTravelDate(request.getTravelDate());
        }
        if (request.getDepartureTime() != null) {
            session.setDepartureTime(request.getDepartureTime());
        }
        if (request.getBusGrade() != null) {
            session.setBusGrade(request.getBusGrade());
        }
        if (request.getSeatNo() != null) {
            session.setSeatNo(request.getSeatNo());
        }

        touch(session);
        publish(SessionEventType.SESSION_UPDATED, session.getId());
        return session;
    }

    /**
     * 이어하기 코드 발급.
     *
     * <ul>
     *   <li>ACTIVE: 코드 발급 후 WAITING 으로 전환</li>
     *   <li>WAITING + 유효한 코드: 같은 코드를 그대로 반환</li>
     *   <li>WAITING + 만료된 코드: 새 코드 발급 및 만료 시간 갱신</li>
     *   <li>CLAIMED / COMPLETED: 재발급 금지</li>
     * </ul>
     */
    @Transactional
    public TransferResponse issueTransfer(Long sessionId) {
        OrderSession session = get(sessionId);
        SessionStatus status = session.getStatus();

        if (status == SessionStatus.CLAIMED || status == SessionStatus.COMPLETED) {
            throw new ApiException(ErrorCode.INVALID_SESSION_STATUS, "이어하기 코드를 발급할 수 있는 상태가 아닙니다.");
        }

        boolean hasValidCode = status == SessionStatus.WAITING
                && session.getTransferCode() != null
                && !isExpired(session.getTransferExpiresAt());

        if (!hasValidCode) {
            session.setTransferCode(generateUniqueCode());
            session.setTransferExpiresAt(now().plus(TRANSFER_TTL));
            session.setStatus(SessionStatus.WAITING);
            touch(session);
        }

        return new TransferResponse(session.getId(), session.getTransferCode(), session.getTransferExpiresAt());
    }

    /** 코드로 세션을 조회한다. 없으면 NOT_FOUND, 만료되었으면 EXPIRED. */
    @Transactional(readOnly = true)
    public OrderSession getByTransferCode(String code) {
        OrderSession session = sessionRepository.findByTransferCode(code)
                .orElseThrow(() -> new ApiException(ErrorCode.TRANSFER_CODE_NOT_FOUND));

        if (isExpired(session.getTransferExpiresAt())) {
            throw new ApiException(ErrorCode.TRANSFER_CODE_EXPIRED);
        }

        return session;
    }

    /** WAITING → CLAIMED. */
    @Transactional
    public OrderSession claim(Long sessionId) {
        OrderSession session = get(sessionId);

        if (session.getStatus() != SessionStatus.WAITING) {
            throw new ApiException(ErrorCode.INVALID_SESSION_STATUS, "이어받을 수 있는 상태가 아닙니다.");
        }

        session.setStatus(SessionStatus.CLAIMED);
        touch(session);
        publish(SessionEventType.SESSION_CLAIMED, session.getId());
        return session;
    }

    /** ACTIVE 또는 CLAIMED → COMPLETED. 예매 필수 정보가 모두 지정되어야 한다. */
    @Transactional
    public OrderSession complete(Long sessionId) {
        OrderSession session = get(sessionId);

        if (session.getStatus() != SessionStatus.ACTIVE
                && session.getStatus() != SessionStatus.CLAIMED) {
            throw new ApiException(ErrorCode.INVALID_SESSION_STATUS, "완료할 수 있는 상태가 아닙니다.");
        }

        if (session.getDestination() == null || session.getDestination().isBlank()
                || session.getTravelDate() == null
                || session.getDepartureTime() == null
                || session.getBusGrade() == null
                || session.getSeatNo() == null || session.getSeatNo().isBlank()) {
            throw new ApiException(
                    ErrorCode.VALIDATION_ERROR,
                    "목적지, 날짜, 시간, 버스, 좌석을 모두 입력해야 합니다."
            );
        }

        session.setStatus(SessionStatus.COMPLETED);
        session.setCurrentStep(BookingStep.COMPLETED);
        touch(session);
        publish(SessionEventType.SESSION_COMPLETED, session.getId());
        return session;
    }

    private boolean isExpired(LocalDateTime expiresAt) {
        return expiresAt != null && !now().isBefore(expiresAt);
    }

    /** 현재 유효한 다른 코드와 충돌하지 않는 6자리 숫자 코드를 만든다. */
    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 100; attempt++) {
            String code = String.format("%06d", RANDOM.nextInt(1_000_000));
            if (!sessionRepository.existsByTransferCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Transfer Code 발급에 실패했습니다.");
    }

    private void touch(OrderSession session) {
        session.setUpdatedAt(now());
    }

    /**
     * 도메인 이벤트를 발행한다. 실제 WS 전송은 {@code AFTER_COMMIT} 단계에서 이뤄지므로
     * (SessionEventPublisher 참조) 트랜잭션이 커밋된 뒤에만 Frontend 로 신호가 나간다.
     */
    private void publish(SessionEventType type, Long sessionId) {
        eventPublisher.publishEvent(SessionEvent.of(type, sessionId, now()));
    }

    private LocalDateTime now() {
        return LocalDateTime.now(clock);
    }
}
