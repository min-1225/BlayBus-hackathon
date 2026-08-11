# FRONTEND GUIDE

## 1. Route

```text
/kiosk
/staff
```

React App 하나에서 관리합니다.

---

## 2. 권장 구조

```text
src/
├── pages/
│   ├── kiosk/
│   │   ├── DestinationPage
│   │   ├── DatePage
│   │   ├── SchedulePage
│   │   ├── SeatPage
│   │   ├── HelpPage
│   │   ├── TransferPage
│   │   └── CompletePage
│   │
│   └── staff/
│       ├── TransferLookupPage
│       ├── SessionDetailPage
│       └── StaffCompletePage
│
├── components/
├── api/
│   ├── sessionApi
│   └── websocket
├── types/
├── mocks/
└── router/
```

파일 확장자와 세부 naming은 팀에서 통일합니다.

---

## 3. 반드시 지킬 것

### API URL 직접 작성 금지

Bad:

```ts
fetch("http://localhost:8080/api/v1/sessions")
```

Good:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
```

그리고 API 호출은 `api/`에 모읍니다.

---

## 4. Backend 대기 금지

Backend가 준비되지 않았으면 Mock으로 개발합니다.

```text
src/mocks/
  session.ts
  schedules.ts
```

Mock JSON은 `API_CONTRACT.md`와 동일한 구조를 사용합니다.

그래야 실제 API 교체 시 화면 코드를 거의 수정하지 않습니다.

---

## 5. Kiosk 상태

Kiosk 화면에서 최소 보관:

```text
sessionId
departure
destination
travelDate
departureTime
busGrade
seatNo
currentStep
status
```

Session 생성 후 `sessionId`를 반드시 기억해야 WebSocket Topic을 구독할 수 있습니다.

---

## 6. Easy Mode

최소 구현:

- 큰 터치 영역
- 큰 글자
- 현재 단계 표시
- 쉬운 용어
- 중요한 CTA 1개
- 항상 보이는 도움 버튼

예:

```text
① 목적지
② 날짜
③ 시간
④ 좌석 ← 지금 여기
⑤ 확인
⑥ 결제
```

---

## 7. Kiosk 핵심 화면

### Destination

```text
어디로 가시나요?
```

### Date

```text
언제 출발하시나요?
```

### Schedule

다음 정보를 명확하게 분리:

```text
출발 시간
버스 종류
남은 좌석
```

### Seat

선택 가능 / 불가 좌석 구분.

### Help

현재까지 선택한 정보를 요약:

```text
✓ 강릉
✓ 8월 11일
✓ 오전 11:30
→ 좌석 선택 중
```

### Transfer

6자리 코드를 아주 크게 표시.

---

## 8. Staff 핵심 화면

### Lookup

6자리 입력.

### Detail

직원이 가장 먼저 봐야 하는 정보:

```text
출발
목적지
날짜
시간
버스
현재 단계
미완료 항목
```

### Complete

직원이 수정 → 저장 → 완료.

---

## 9. WebSocket 연결

Kiosk:

```text
Session 생성
 ↓
sessionId 획득
 ↓
STOMP 연결
 ↓
/topic/sessions/{sessionId} 구독
```

`SESSION_COMPLETED` 수신:

- 완료 화면으로 이동
- 또는 최신 Session GET 후 완료 화면 표시

---

## 10. Frontend PR 최소 기준

- 페이지 직접 접속 가능
- Console Error 없음
- Mock 또는 실제 API로 정상 동작
- 빈 상태 처리
- Loading 처리
- Error 처리
- 모바일 Staff UI 확인
- API URL 하드코딩 없음
