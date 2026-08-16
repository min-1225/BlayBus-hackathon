# FRONTEND GUIDE

> 실제 코드 기준 사용법은 [`frontend/README.md`](../frontend/README.md) 를 보세요.
> 이 문서는 화면 설계 기준을 다룹니다.

## 1. Route

| 경로 | 화면 |
|---|---|
| `/` | 고객용 / 직원용 선택 |
| `/kiosk` | 목적지 선택 |
| `/kiosk/date` | 날짜 선택 |
| `/kiosk/schedule` | 시간 / 버스 등급 |
| `/kiosk/seat` | 좌석 선택 |
| `/kiosk/confirm` | 예매 내용 최종 확인 |
| `/kiosk/payment` | 결제 수단 선택 / 결제 완료 |
| `/kiosk/help` | 도움받기 (지금까지 선택 요약) |
| `/kiosk/transfer` | 6자리 코드 안내 + 완료 대기 |
| `/kiosk/complete` | 예매 완료 |
| `/staff` | 이어하기 번호 조회 |
| `/staff/sessions/:sessionId` | 예매 상세 / 이어받기 / 수정 |
| `/staff/sessions/:sessionId/complete` | 완료 확인 |

React App 하나에서 관리합니다.

---

## 2. 구조 (확정)

```text
src/
├── api/            REST / WebSocket. URL 문자열은 여기에만 존재한다
├── components/     BigButton, KioskLayout, StepIndicator, StatusView
├── config/env.ts   환경변수를 읽는 유일한 지점
├── hooks/          useSessionQuery 등 공용 Hook
├── mocks/          MSW 가짜 Backend
├── pages/kiosk|staff/
├── router/
├── session/        Kiosk 예매 상태 (Context + useReducer)
└── types/          API Contract 와 1:1 대응
```

기술 선택 근거는 [`TECH_STACK.md`](TECH_STACK.md) 를 보세요.

Import 는 `@/` 절대경로를 씁니다.

```ts
import { BigButton } from '@/components/BigButton'
```

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

MSW 가 `API_CONTRACT.md` 를 그대로 구현한 가짜 Backend 역할을 합니다.
`src/mocks/handlers.ts` 에 상태 전이와 404/409 오류까지 들어 있습니다.

```env
VITE_USE_MOCK=true    # Backend 없이 개발
VITE_USE_MOCK=false   # 실제 Backend
```

화면 코드는 두 모드에서 동일합니다. 연동 시 고칠 코드가 없습니다.

Contract 가 바뀌면 `handlers.ts` 도 같이 고쳐야 합니다.
그러지 않으면 Frontend 가 틀린 가정 위에서 계속 개발하게 됩니다.

---

## 5. Kiosk 상태

`useKioskSession()` 하나로 다룹니다. 화면이 `sessionId` 나 `fetch` 를 직접 만지지 않습니다.

```ts
const { session, patch, isLoading, error } = useKioskSession()

const updated = await patch({ destination: '강릉', currentStep: 'DATE' })
if (updated) navigate('/kiosk/date')   // 실패하면 null — 넘어가지 않는다
```

`patch` 는 서버 저장(PATCH)과 로컬 상태 갱신을 한 번에 처리합니다.
세션이 아직 없으면 자동으로 생성하므로 화면에서 순서를 신경 쓰지 않아도 됩니다.

`sessionId` 는 `sessionStorage` 에 저장되어 새로고침해도 진행 상황이 유지됩니다.

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

`api/websocket.ts` 의 `subscribeSession` 하나만 씁니다.
Mock 모드(BroadcastChannel)와 실서버(STOMP)를 알아서 갈라주므로 호출부는 동일합니다.

```ts
useEffect(() => {
  if (!sessionId) return
  return subscribeSession(sessionId, (event) => {
    if (event.type === 'SESSION_COMPLETED') {
      void refresh().then(() => navigate('/kiosk/complete'))
    }
  })
}, [sessionId, refresh, navigate])
```

지켜야 할 두 가지:

1. 반환값은 **구독 해제 함수**입니다. `useEffect` 에서 그대로 return 하세요.
   안 하면 화면 이동 때마다 연결이 쌓입니다.
2. 이벤트는 "무언가 바뀌었다"는 신호일 뿐입니다.
   **데이터는 이벤트가 아니라 `refresh()` 로 다시 읽습니다.**

참고 구현: `pages/kiosk/TransferPage.tsx`

---

## 10. Frontend PR 최소 기준

```text
[ ] npm run verify 통과 (typecheck + lint + format + build)
[ ] 주소 직접 입력으로 페이지 접속 가능
[ ] Console Error 없음
[ ] Loading / Error / Empty 처리
[ ] API URL 하드코딩 없음
[ ] 임의의 색·크기 값 대신 index.css 토큰 사용
[ ] Staff 화면은 모바일 폭(375px)에서 확인
```
