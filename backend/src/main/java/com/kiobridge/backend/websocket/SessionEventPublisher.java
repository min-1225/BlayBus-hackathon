package com.kiobridge.backend.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 세션 변경 이벤트를 STOMP Topic(/topic/sessions/{id})으로 발행한다.
 *
 * {@link TransactionalEventListener} 의 {@code AFTER_COMMIT} 단계에서만 전송하므로,
 * DB 트랜잭션이 실패해 롤백되면 이벤트도 발행되지 않는다
 * ("트랜잭션이 실패했는데 이벤트만 먼저 전송되는 구조"를 방지).
 *
 * 전송에는 Spring 이 제공하는 {@link SimpMessagingTemplate#convertAndSend} 를 사용한다.
 */
@Component
public class SessionEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public SessionEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSessionEvent(SessionEvent event) {
        messagingTemplate.convertAndSend(event.destination(), event);
    }
}
