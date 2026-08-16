package com.kiobridge.backend.websocket;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP over WebSocket 설정.
 *
 * Frontend(@stomp/stompjs)는 {@code brokerURL} 로 {@code /ws} 에 직접 연결한다(SockJS 아님).
 * 따라서 순수 STOMP WebSocket Endpoint 를 등록하고, {@code /topic} 을 Simple Broker 로 둔다.
 *
 * Handshake 허용 Origin 은 REST 와 동일하게 {@code app.cors.allowed-origins}(env: APP_CORS_ALLOWED_ORIGINS)
 * 로 관리한다. 로컬 기본값은 Vite 개발 서버(5173/5174)를 포함한다.
 *
 * Spring 이 제공하는 {@link EnableWebSocketMessageBroker} / {@link WebSocketMessageBrokerConfigurer}
 * 를 그대로 활용하며, 브로커를 직접 구현하지 않는다.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final String[] allowedOrigins;

    public WebSocketConfig(@Value("${app.cors.allowed-origins}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns(allowedOrigins);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
