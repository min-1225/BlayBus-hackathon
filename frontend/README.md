# Frontend — KioBridge Assist

Backend 없이 전체 데모 시나리오를 돌릴 수 있는 상태로 세팅되어 있습니다.

---

## 1. 시작하기 (3분)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

`http://localhost:5173` 접속.

`.env.local` 의 `VITE_USE_MOCK=true` 상태에서는 MSW 가 가짜 Backend 역할을 하므로
Spring Boot 를 띄우지 않아도 모든 화면이 동작합니다.

---

## 2. 명령어

| 명령어             | 하는 일                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `npm run dev`      | 개발 서버 (5173)                                                 |
| `npm run verify`   | **PR 올리기 전 반드시 실행** — typecheck + lint + format + build |
| `npm run test:e2e` | Chromium에서 키오스크 → 직원 인계 → 완료 흐름을 자동 검증        |
| `npm run format`   | Prettier 자동 정리                                               |
| `npm run lint:fix` | ESLint 자동 수정                                                 |
| `npm run build`    | 프로덕션 빌드                                                    |

CI 가 `npm run verify` 와 같은 검사를 돌립니다. 로컬에서 통과시키고 PR 을 올리세요.

최초 한 번만 Chromium을 설치한 뒤 E2E를 실행합니다.

```bash
npx playwright install chromium
npm run test:e2e
```

---

## 3. 폴더 구조

```text
src/
├── api/            REST / WebSocket 호출. URL 문자열은 여기에만 존재한다
│   ├── http.ts         fetch 래퍼 + ApiError + 한국어 오류 문구
│   ├── sessionApi.ts   Contract 의 엔드포인트 7개
│   └── websocket.ts    실시간 구독 (Mock/실서버 자동 전환)
│
├── components/     두 사람이 공유하는 UI 블록
│   ├── BigButton.tsx      키오스크 표준 버튼
│   ├── KioskLayout.tsx    Kiosk 화면 공통 껍데기 (단계표시 + 도움버튼)
│   ├── StepIndicator.tsx  ① 목적지 ② 날짜 ③ 시간 ...
│   └── StatusView.tsx     Loading / Error / Empty
│
├── config/env.ts   환경변수를 읽는 유일한 지점
├── hooks/          공용 Hook
├── mocks/          가짜 Backend (MSW). Backend 연동 후에는 실행되지 않는다
├── pages/          화면
├── router/         라우팅 표
├── session/        Kiosk 예매 상태 (Context + useReducer)
└── types/          API Contract 와 1:1 대응하는 타입
```

`@/` 로 절대경로 import 가 됩니다. `../../../` 쓰지 마세요.

```ts
import { BigButton } from '@/components/BigButton'
```

---

## 4. 화면 담당

| 경로                           | 파일                                 | 상태                              |
| ------------------------------ | ------------------------------------ | --------------------------------- |
| `/`                            | `pages/HomePage.tsx`                 | ✅ 고객용 / 직원용 선택           |
| `/kiosk`                       | `pages/kiosk/DestinationPage.tsx`    | ✅ 완성                           |
| `/kiosk/date`                  | `pages/kiosk/DatePage.tsx`           | ✅ 완성                           |
| `/kiosk/schedule`              | `pages/kiosk/SchedulePage.tsx`       | ✅ 완성                           |
| `/kiosk/seat`                  | `pages/kiosk/SeatPage.tsx`           | ✅ 완성                           |
| `/kiosk/confirm`               | `pages/kiosk/ConfirmationPage.tsx`   | ✅ 완성                           |
| `/kiosk/payment`               | `pages/kiosk/PaymentPage.tsx`        | ✅ 완성                           |
| `/kiosk/help`                  | `pages/kiosk/HelpPage.tsx`           | ✅ 완성                           |
| `/kiosk/transfer`              | `pages/kiosk/TransferPage.tsx`       | ✅ 완성 (**WebSocket 참고 구현**) |
| `/kiosk/complete`              | `pages/kiosk/KioskCompletePage.tsx`  | ✅ 완성                           |
| `/staff`                       | `pages/staff/TransferLookupPage.tsx` | ✅ 완성 (**참고 구현**)           |
| `/staff/sessions/:id`          | `pages/staff/SessionDetailPage.tsx`  | ✅ Claim / 수정 / 완료            |
| `/staff/sessions/:id/complete` | `pages/staff/StaffCompletePage.tsx`  | ✅ 완성                           |

새 화면을 만들 때는 **DestinationPage.tsx 를 먼저 읽고** 같은 패턴으로 작성하세요.

---

## 5. 반드시 지킬 것 4가지

### ① URL 을 화면에 쓰지 않는다

```ts
// ✗ 금지
fetch('http://localhost:8080/api/v1/sessions')

// ✓
import { createSession } from '@/api/sessionApi'
```

새 엔드포인트가 필요하면 `api/sessionApi.ts` 에 함수를 추가합니다.

### ② Kiosk 상태는 useKioskSession 으로만 다룬다

```ts
const { session, patch, isLoading } = useKioskSession()

// 서버 저장 + 로컬 상태 갱신이 한 번에 처리된다
const updated = await patch({ destination: '강릉', currentStep: 'DATE' })
if (updated) navigate('/kiosk/date')
```

`patch` 는 실패하면 `null` 을 돌려줍니다. **null 이면 다음 화면으로 넘어가지 마세요.**
오류 문구는 `KioskLayout` 이 자동으로 표시합니다.

### ③ 색과 크기는 토큰을 쓴다

`src/index.css` 의 `@theme` 에 정의된 값만 사용합니다.

```tsx
// ✓
<p className="text-kiosk-title text-brand">

// ✗ 임의의 값
<p className="text-[42px] text-[#3b5bdb]">
```

없는 토큰이 필요하면 `index.css` 에 추가하고 팀에 공유하세요.

### ④ Loading / Error / Empty 를 반드시 처리한다

`components/StatusView.tsx` 의 `LoadingView` / `ErrorView` / `EmptyView` 를 씁니다.

---

## 6. Mock Backend

`src/mocks/handlers.ts` 가 `docs/API_CONTRACT.md` 를 그대로 구현합니다.
상태 전이(ACTIVE → WAITING → CLAIMED → COMPLETED)와 409/404 오류까지 실제 서버처럼 동작하므로,
Backend 연동 시 "Mock 에서는 됐는데" 하는 상황이 생기지 않습니다.

데이터는 `localStorage` 에 저장됩니다. **키오스크 탭과 직원 탭이 같은 세션을 공유**하므로
두 탭을 나란히 띄우고 전체 시나리오를 테스트할 수 있습니다.

### 데모 시나리오 테스트

1. 탭 A: `http://localhost:5173/kiosk` → 강릉 선택 → ... → 도움받기 → 6자리 코드 확인
2. 탭 B: `http://localhost:5173/staff` → 그 코드 입력 → 세션 복원 확인
3. 탭 B 에서 완료 처리 → **탭 A 가 새로고침 없이 완료 화면으로 전환**

3번은 Mock 모드에서 `BroadcastChannel` 로, 실서버에서는 STOMP 로 동작합니다.
화면 코드는 둘 다 동일합니다 (`api/websocket.ts` 가 알아서 갈라집니다).

### 상태 초기화

브라우저 콘솔에서:

```js
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## 7. Backend 연동 (Phase 2)

Backend 가 8080 에 뜨면 `.env.local` 한 줄만 바꿉니다.

```env
VITE_USE_MOCK=false
```

`VITE_API_BASE_URL` 은 **비워 둡니다.** Vite Proxy 가 `/api` 와 `/ws` 를 8080 으로 넘겨주므로
CORS 설정 없이 바로 붙습니다.

화면 코드는 한 줄도 고치지 않습니다. 이게 Mock 을 이렇게 만든 이유입니다.

---

## 8. PR 전 체크리스트

```text
[ ] npm run verify 통과
[ ] 주소 직접 입력으로 페이지 접속됨
[ ] Console Error 없음
[ ] Loading / Error / Empty 처리함
[ ] API URL 하드코딩 없음
[ ] Staff 화면은 모바일 폭(375px)에서 확인함
[ ] API Contract 변경 시 docs/API_CONTRACT.md 도 수정하고 PR 제목에 [API CHANGE] 표기
```
