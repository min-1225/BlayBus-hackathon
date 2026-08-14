package com.kiobridge.backend.websocket;

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
 * Spring 이 제공하는 {@link EnableWebSocketMessageBroker} / {@link WebSocketMessageBrokerConfigurer}
 * 를 그대로 활용하며, 브로커를 직접 구현하지 않는다.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 순수 WebSocket handshake. 로컬은 Vite Proxy 를 통하지만, 직접 연결도 허용한다.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
