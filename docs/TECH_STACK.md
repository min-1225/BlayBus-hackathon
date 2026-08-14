# TECH STACK

> 확정된 기술 스택과 **왜 그것을 골랐는지**.
>
> 새 라이브러리를 추가하기 전에 이 문서를 먼저 읽고, 추가했다면 이 문서를 갱신합니다.

---

## 1. 한눈에 보기

| 영역 | 선택 | 버전 |
|---|---|---|
| Frontend Framework | React | 19 |
| Language | TypeScript | 6 |
| Build Tool | Vite | 8 |
| Routing | React Router | 8 |
| Styling | Tailwind CSS | 4 |
| Mock Backend | MSW (Mock Service Worker) | 2 |
| State | React Context + useReducer | 내장 |
| Realtime Client | @stomp/stompjs | 7 |
| Format / Lint | Prettier + ESLint | — |
| Backend Framework | Spring Boot | 3.x |
| Backend Web | Spring Web, Spring Data JPA | — |
| Backend Realtime | Spring WebSocket + STOMP | — |
| Runtime | Node 22 (CI) / Java 21 | — |
| CI | GitHub Actions | — |

---

## 2. Frontend 선택 이유

### React 19 + TypeScript + Vite

팀 전원이 아는 조합이고, Vite 는 설정 없이 빠릅니다.
TypeScript 를 쓰는 진짜 이유는 타입 안전성보다 **API Contract 강제**입니다.
`src/types/session.ts` 가 Contract 와 1:1로 대응하므로, Backend Enum 이 바뀌면
Frontend 에서 컴파일 에러가 나서 즉시 발견됩니다.

### Tailwind CSS 4

키오스크 UI 의 핵심은 "크게, 일관되게"입니다.
`src/index.css` 의 `@theme` 에 Easy Mode 토큰을 정의해두고 두 명이 같은 값을 씁니다.

```css
--text-kiosk-title: 2.75rem;   /* 큰 글자 */
--spacing-touch: 5rem;         /* 최소 터치 높이 80px */
--spacing-touch-lg: 7rem;      /* 주요 CTA 112px */
```

CSS Modules 를 쓰지 않은 이유: 화면 수만큼 파일이 늘고, 두 사람 사이에
클래스 네이밍 규약을 따로 정해야 합니다. 5일짜리 프로젝트에서는 비용이 큽니다.

### MSW (Mock Service Worker) — **가장 중요한 선택**

Frontend 가 Backend 를 기다리지 않게 하는 장치입니다.

MSW 는 Service Worker 로 **네트워크 레벨에서** fetch 를 가로챕니다.
따라서 화면 코드도, `api/` 코드도 Mock 을 전혀 모릅니다.

```text
[Mock 모드]  화면 → api/sessionApi → fetch → MSW 가 가로챔 → 가짜 응답
[실서버]     화면 → api/sessionApi → fetch → Spring Boot   → 진짜 응답
```

전환은 `.env.local` 한 줄입니다.

```env
VITE_USE_MOCK=false
```

`api/` 안에 `if (mock)` 분기를 넣는 방식을 쓰지 않은 이유:
연동 시점에 함수 7개를 전부 손봐야 하고, 그 과정에서 실수가 나옵니다.
Contract 를 지키는 Mock 을 만들어두면 **연동 시 고칠 코드가 0줄**입니다.

Mock 은 상태 전이(`ACTIVE → WAITING → CLAIMED → COMPLETED`)와
404 / 409 오류까지 실제 서버와 동일하게 구현했습니다.
"Mock 에서는 됐는데 실서버에서 409" 같은 상황을 막기 위해서입니다.

Mock 데이터는 `localStorage` 에 저장되므로 **키오스크 탭과 직원 탭이 세션을 공유**합니다.
Backend 없이 데모 시나리오 전체를 리허설할 수 있습니다.

### Context + useReducer (상태 관리 라이브러리 없음)

공유해야 하는 상태는 `Session` 객체 **하나**뿐입니다.
Zustand / Redux 를 넣으면 팀원마다 사용법이 갈리고, 이 규모에서 얻는 게 없습니다.

`src/session/KioskSessionProvider.tsx` 가 서버 저장과 로컬 상태 갱신을 한 번에 처리합니다.

```ts
const { session, patch, isLoading } = useKioskSession()
await patch({ destination: '강릉', currentStep: 'DATE' })
```

화면은 `fetch` 도 `sessionId` 도 직접 다루지 않습니다.

### @stomp/stompjs

Backend 가 Spring WebSocket + STOMP 이므로 클라이언트도 STOMP 를 씁니다.

Mock 모드에서는 STOMP 서버가 없으므로 `BroadcastChannel` 로 대체합니다.
`api/websocket.ts` 가 두 경우를 감추고 항상 같은 인터페이스를 제공합니다.

```ts
// Mock 이든 실서버든 호출부는 동일하다
useEffect(() => subscribeSession(sessionId, handleEvent), [sessionId])
```

---

## 3. 쓰지 않기로 한 것

| 안 쓰는 것 | 이유 |
|---|---|
| Redux / Zustand | 공유 상태가 Session 하나뿐 |
| React Query / SWR | 호출 지점이 적고, 캐시 무효화 규칙을 팀에 교육할 시간이 없음 |
| CSS-in-JS | 런타임 비용 + Tailwind 와 중복 |
| Storybook | 5일 안에 유지 비용을 못 뽑음 |
| 별도 Node Realtime 서버 | Spring 하나로 REST + WS 처리 |
| Kafka / Redis / RabbitMQ | MVP 범위 밖 (README §3 OUT OF SCOPE) |
| 테스트 프레임워크 | 해커톤 일정상 수동 시나리오 테스트로 대체. 도입한다면 Vitest |

추가하고 싶은 라이브러리가 생기면 **Integration Lead 와 상의한 뒤** 이 표에 근거를 남깁니다.
Phase 5(Demo Freeze) 이후에는 신규 라이브러리 도입 금지입니다.

---

## 4. 로컬 개발 환경

| 항목 | 값 |
|---|---|
| Node | 22 이상 |
| Java | 21 |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| REST Base | `/api/v1` |
| WebSocket | `/ws` |

### CORS 를 신경 쓰지 않아도 되는 이유

Vite Dev Server 에 Proxy 를 걸어두었습니다.

```ts
// vite.config.ts
proxy: {
  '/api': { target: 'http://localhost:8080', changeOrigin: true },
  '/ws':  { target: 'http://localhost:8080', changeOrigin: true, ws: true },
}
```

Frontend 는 `VITE_API_BASE_URL` 을 **비워둔 채** `/api/v1/...` 상대경로로 호출하고,
Vite 가 8080 으로 넘겨줍니다. 브라우저 입장에서는 같은 Origin 이라 CORS 가 발생하지 않습니다.

Backend 담당자는 로컬에서 CORS 설정을 하지 않아도 됩니다.
**배포 환경에서는 필요합니다** (Phase 4).

---

## 5. 품질 게이트

로컬과 CI 가 같은 검사를 돌립니다.

```bash
cd frontend
npm run verify   # typecheck → lint → format:check → build
```

| 단계 | 잡는 문제 |
|---|---|
| `typecheck` | Contract 불일치, 타입 오류 |
| `lint` | React Hooks 규칙 위반, 미사용 변수 |
| `format:check` | 포맷 차이로 인한 무의미한 diff / conflict |
| `build` | 프로덕션 빌드 실패 |

`format:check` 를 넣은 이유는 취향 통일이 아니라 **머지 충돌 감소**입니다.
포맷이 제각각이면 같은 파일을 두 사람이 만졌을 때 실제 변경과 포맷 변경이 섞여서 리뷰가 불가능해집니다.

Backend 는 `./gradlew build` 를 CI 에서 돌립니다.

---

## 6. 배포 (Phase 4)

순서가 중요합니다.

```text
1. Backend 배포 → Public URL 확보
2. Frontend 환경변수에 그 URL 입력
     VITE_USE_MOCK=false
     VITE_API_BASE_URL=https://api.example.com
     VITE_WS_BASE_URL=https://api.example.com
3. Frontend 배포
4. Backend CORS 허용 Origin 에 Frontend 도메인 추가
5. HTTPS 확인 → WebSocket 은 자동으로 wss:// 로 붙는다 (api/websocket.ts 가 변환)
6. 배포 URL 에서 E2E
```

배포 플랫폼은 `docs/DEPLOYMENT_GUIDE.md` 를 따릅니다.

배포 환경에서 SPA 라우팅이 동작하려면 **모든 경로를 `index.html` 로 fallback** 해야 합니다.
`/staff` 를 주소창에 직접 입력했을 때 404 가 나면 이 설정이 빠진 것입니다.
