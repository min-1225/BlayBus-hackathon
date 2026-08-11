# API CONTRACT

> 이 문서는 Frontend와 Backend 사이의 **공식 계약**입니다.

API가 변경되면 코드를 먼저 몰래 바꾸지 말고 **이 문서를 먼저 수정한 뒤 팀에 공유**합니다.

---

# 0. 공통

Base URL:

```text
/api/v1
```

Content-Type:

```text
application/json
```

공통 성공 응답 Wrapper는 MVP에서 사용하지 않는 것을 권장합니다.

즉:

```json
{
  "id": 123,
  "status": "ACTIVE"
}
```

처럼 필요한 데이터 자체를 반환합니다.

---

# 1. Enum

## SessionStatus

```text
ACTIVE
WAITING
CLAIMED
COMPLETED
```

## BookingStep

```text
DESTINATION
DATE
SCHEDULE
SEAT_SELECTION
CONFIRMATION
PAYMENT
COMPLETED
```

## BusGrade

```text
STANDARD
PREMIUM
```

---

# 2. Session Model

```json
{
  "id": 123,
  "status": "ACTIVE",
  "currentStep": "SCHEDULE",
  "departure": "동서울",
  "destination": "강릉",
  "travelDate": "2026-08-11",
  "departureTime": "11:30",
  "busGrade": "PREMIUM",
  "seatNo": null,
  "transferCode": null,
  "createdAt": "2026-08-11T10:30:00",
  "updatedAt": "2026-08-11T10:32:00"
}
```

---

# 3. Create Session

```http
POST /api/v1/sessions
```

Request:

```json
{
  "departure": "동서울"
}
```

Response `201`:

```json
{
  "id": 123,
  "status": "ACTIVE",
  "currentStep": "DESTINATION",
  "departure": "동서울",
  "destination": null,
  "travelDate": null,
  "departureTime": null,
  "busGrade": null,
  "seatNo": null,
  "transferCode": null
}
```

---

# 4. Update Session

```http
PATCH /api/v1/sessions/{sessionId}
```

Request 예시:

```json
{
  "currentStep": "SEAT_SELECTION",
  "destination": "강릉",
  "travelDate": "2026-08-11",
  "departureTime": "11:30",
  "busGrade": "PREMIUM",
  "seatNo": null
}
```

모든 필드는 optional로 처리해도 됩니다.

Response `200`:

업데이트된 Session.

---

# 5. Create Transfer

```http
POST /api/v1/sessions/{sessionId}/transfer
```

동작:

```text
ACTIVE → WAITING
```

Response `200`:

```json
{
  "sessionId": 123,
  "code": "381492",
  "expiresAt": "2026-08-11T11:00:00"
}
```

규칙:

- 6자리 숫자
- 유효 시간은 Backend 설정값으로 관리
- MVP 기본 권장: 15분
- 만료 기능이 일정상 부담이면 `expiresAt`만 반환하고 실제 검증은 후순위 가능

---

# 6. Find Session By Transfer Code

```http
GET /api/v1/transfers/{code}
```

Response `200`:

```json
{
  "id": 123,
  "status": "WAITING",
  "currentStep": "SEAT_SELECTION",
  "departure": "동서울",
  "destination": "강릉",
  "travelDate": "2026-08-11",
  "departureTime": "11:30",
  "busGrade": "PREMIUM",
  "seatNo": null,
  "transferCode": "381492"
}
```

Not Found:

```http
404
```

---

# 7. Claim Session

```http
POST /api/v1/sessions/{sessionId}/claim
```

Request:

```json
{}
```

동작:

```text
WAITING → CLAIMED
```

Response:

업데이트된 Session.

이미 Claim 되었다면 권장:

```http
409 Conflict
```

---

# 8. Complete Session

```http
POST /api/v1/sessions/{sessionId}/complete
```

전제:

직원이 필요한 값을 먼저 `PATCH`하여 저장합니다.

동작:

```text
CLAIMED → COMPLETED
```

Response:

```json
{
  "id": 123,
  "status": "COMPLETED",
  "currentStep": "COMPLETED",
  "departure": "동서울",
  "destination": "강릉",
  "travelDate": "2026-08-11",
  "departureTime": "11:30",
  "busGrade": "PREMIUM",
  "seatNo": "7"
}
```

Complete 성공 직후 Backend는 WebSocket Event를 Publish합니다.

---

# 9. WebSocket

Endpoint:

```text
/ws
```

Subscribe:

```text
/topic/sessions/{sessionId}
```

---

# 10. WebSocket Event

## SESSION_CLAIMED

```json
{
  "type": "SESSION_CLAIMED",
  "sessionId": 123,
  "occurredAt": "2026-08-11T10:40:00"
}
```

## SESSION_UPDATED

```json
{
  "type": "SESSION_UPDATED",
  "sessionId": 123,
  "occurredAt": "2026-08-11T10:41:00"
}
```

## SESSION_COMPLETED

```json
{
  "type": "SESSION_COMPLETED",
  "sessionId": 123,
  "occurredAt": "2026-08-11T10:42:00"
}
```

MVP에서 Kiosk가 반드시 처리해야 하는 이벤트는:

```text
SESSION_COMPLETED
```

나머지는 시간 여유에 따라 UI에 활용합니다.

---

# 11. 오류 응답

권장 공통 형식:

```json
{
  "code": "SESSION_NOT_FOUND",
  "message": "세션을 찾을 수 없습니다."
}
```

최소 Error Code:

```text
SESSION_NOT_FOUND
TRANSFER_CODE_NOT_FOUND
TRANSFER_CODE_EXPIRED
INVALID_SESSION_STATUS
VALIDATION_ERROR
```

---

# 12. Contract 변경 절차

1. 변경 필요 발견
2. 팀 채팅 공유
3. `API_CONTRACT.md` 수정
4. Frontend/Backend 담당자 확인
5. 구현
6. PR Description에 `API Contract Changed` 표기

긴급 상황에서도 Frontend와 Backend가 서로 다른 Enum을 쓰는 상태만은 만들지 않습니다.
