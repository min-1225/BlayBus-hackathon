package com.kiobridge.backend.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 시간 의존 로직(Transfer Code 만료)을 테스트에서 제어할 수 있도록 {@link Clock} 을 Bean 으로 주입한다.
 * {@code Clock} 은 Java 표준 라이브러리다.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
