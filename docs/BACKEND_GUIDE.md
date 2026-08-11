# BACKEND GUIDE

## 1. 권장 Package

```text
session/
  SessionController
  SessionService
  SessionRepository
  OrderSession
  SessionStatus
  BookingStep
  dto/

websocket/
  WebSocketConfig
  SessionEvent
  SessionEventPublisher

common/
  GlobalExceptionHandler
```

과도한 Clean Architecture 적용은 하지 않습니다.

---

## 2. Entity

핵심 Entity는 `OrderSession` 하나면 충분합니다.

권장 Field:

```text
id
status
currentStep
departure
destination
travelDate
departureTime
busGrade
seatNo
transferCode
transferExpiresAt
createdAt
updatedAt
```

---

## 3. 상태 전이

허용:

```text
ACTIVE → WAITING
WAITING → CLAIMED
CLAIMED → COMPLETED
```

예를 들어 이미 `COMPLETED`인 Session을 다시 Claim하지 못하게 합니다.

---

## 4. Transfer Code

요구:

- 6자리 숫자
- 현재 유효한 코드와 충돌하지 않게 생성
- 가능하면 만료 시간 관리

예:

```text
381492
```

보안을 복잡하게 만들 필요는 없지만 Session 전체 데이터를 코드에 인코딩하지 않습니다.

---

## 5. API 구현 순서

1. `POST /sessions`
2. `PATCH /sessions/{id}`
3. `POST /sessions/{id}/transfer`
4. `GET /transfers/{code}`
5. `POST /sessions/{id}/claim`
6. `POST /sessions/{id}/complete`

WebSocket은 이 REST 흐름을 검증한 다음 구현합니다.

---

## 6. WebSocket

Endpoint:

```text
/ws
```

Broker:

```text
/topic
```

Publish:

```text
/topic/sessions/{sessionId}
```

MVP 필수 이벤트:

```text
SESSION_COMPLETED
```

권장 추가:

```text
SESSION_CLAIMED
SESSION_UPDATED
```

---

## 7. CORS

개발:

```text
http://localhost:5173
```

운영:

Frontend 실제 배포 Origin.

Origin을 Controller마다 흩어놓지 말고 설정에서 관리합니다.

---

## 8. Database

DB 종류보다 계약과 흐름이 중요합니다.

초기 개발은 H2 사용도 가능합니다.

배포 환경에서 H2 파일/메모리 제약이 문제가 되면 MySQL/PostgreSQL로 전환합니다.

DB 전환 시 Entity/Repository 계약은 유지합니다.

---

## 9. Validation

최소:

- Session 존재 여부
- Transfer Code 존재 여부
- Session Status
- Enum 유효성
- 날짜/시간 문자열 형식

---

## 10. Backend PR 최소 기준

- Application 실행
- 관련 API 직접 테스트
- HTTP Status 확인
- API Contract 준수
- 잘못된 상태 전이 차단
- 예외 JSON 확인
- 민감 정보 로그 출력 금지
