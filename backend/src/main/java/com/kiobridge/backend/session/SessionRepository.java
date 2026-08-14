package com.kiobridge.backend.session;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 기본 CRUD 는 Spring Data JPA 의 {@link JpaRepository} 가 제공한다.
 * 도메인에 필요한 조회(코드로 세션 찾기, 코드 중복 확인)만 선언한다.
 */
public interface SessionRepository extends JpaRepository<OrderSession, Long> {

    Optional<OrderSession> findByTransferCode(String transferCode);

    boolean existsByTransferCode(String transferCode);
}
