package com.kiobridge.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * REST(/api/**) 교차출처 설정.
 *
 * 로컬은 Vite Proxy 로 동일 출처라 필요 없지만, 배포 환경(Vercel ↔ Render)은 출처가 달라 필요하다.
 * 허용 Origin 은 {@code app.cors.allowed-origins}(env: APP_CORS_ALLOWED_ORIGINS)로 관리하고
 * Controller 마다 흩뿌리지 않는다.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public CorsConfig(@Value("${app.cors.allowed-origins}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
