# KioBridge Assist
> **동서울터미널 승차권 발권 키오스크 시나리오 기반 배리어프리 보조 소프트웨어 MVP**

사용자가 키오스크 예매 도중 어려움을 겪어도 **지금까지 진행한 과정을 잃지 않고**, 직원 화면에서 같은 세션을 이어받아 예매를 완료할 수 있도록 하는 MVP입니다.

이 저장소는 **5인 해커톤 팀의 병렬 개발과 마지막 통합을 전제로** 구성합니다.

---

## 1. 핵심 문제

고령 사용자나 디지털 기기에 익숙하지 않은 사용자는 키오스크의 모든 단계를 어려워하는 것이 아닙니다.

예를 들어 버스 승차권 발권 과정에서 사용자는 다음 단계까지는 스스로 진행할 수 있습니다.

1. 목적지 선택
2. 날짜 선택
3. 출발 시간 선택

하지만 이후의 좌석 선택, 버스 등급 이해, 결제 단계에서 막힐 수 있습니다.

기존 방식에서는 직원의 도움을 받을 때 이미 진행한 내용을 다시 설명하거나 처음부터 다시 시작해야 할 수 있습니다.

KioBridge Assist는 이 문제를 다음과 같이 해결합니다.

```text
키오스크 예매 진행
        ↓
현재 단계에서 어려움 발생
        ↓
[지금까지 저장하고 도움받기]
        ↓
현재 예매 Session 저장
        ↓
6자리 이어하기 코드 발급
        ↓
직원 화면에서 코드 입력
        ↓
같은 Session 복원
        ↓
직원이 막힌 단계부터 이어서 진행
        ↓
예매 완료
        ↓
원래 키오스크 화면도 실시간 완료 처리
```

---

## 2. MVP 데모 시나리오

본 MVP는 **동서울터미널의 버스 승차권 발권 키오스크 환경을 가정한 시뮬레이션**입니다.

> 실제 동서울터미널 시스템/POS/결제망과 연동하는 프로젝트가 아닙니다.

### 사용자 흐름

```text
동서울
  ↓
강릉 선택
  ↓
날짜 선택
  ↓
11:30 우등 선택
  ↓
좌석 선택에서 어려움 발생
  ↓
[지금까지 저장하고 도움받기]
  ↓
381492 발급
  ↓
직원 화면에서 381492 입력
  ↓
동서울 → 강릉 / 11:30 / 우등 / 좌석 미선택 상태 복원
  ↓
직원이 좌석 선택
  ↓
결제 완료 Simulation
  ↓
키오스크 화면이 WebSocket으로 자동 완료 처리
```

---

## 3. MVP 핵심 기능

### MUST

- 키오스크 예매 플로우
- 쉬운 화면 모드
- 현재 진행 단계 표시
- 예매 Session 생성/저장
- 6자리 이어하기 코드 발급
- 직원 화면에서 Session 조회
- 직원 화면에서 Session Claim
- 직원 화면에서 예매 상태 수정
- 예매 완료 처리
- WebSocket/STOMP 기반 실시간 완료 동기화
- 배포된 URL에서 전체 시나리오 동작

### SHOULD

- Transfer Code 만료
- 오류 메시지/빈 상태 처리
- 모바일에서도 직원 화면 사용 가능
- 기본 접근성 속성 적용

### OPTIONAL

- QR 기반 이어받기
- 일정 시간 입력이 없을 때 도움 UI 노출
- 더 많은 목적지/시간표 Mock Data

### OUT OF SCOPE

- 실제 카드 결제
- 실제 버스 예매 시스템 연동
- 실제 POS 연동
- 실사용 개인정보 저장
- AI/ML
- 얼굴 인식
- FCM
- Kafka / Redis / RabbitMQ
- 복잡한 회원 인증

---

## 4. 기술 스택

확정된 스택과 선택 근거는 [`docs/TECH_STACK.md`](docs/TECH_STACK.md)에 있습니다.

### Frontend

- React 19 + TypeScript + Vite
- React Router
- Tailwind CSS 4 (Easy Mode 토큰)
- HTTP Client: `fetch` (`src/api/http.ts` 래퍼로 통일)
- MSW — Backend 없이 개발/데모 가능한 가짜 Backend
- 상태: Context + useReducer
- STOMP Client (`@stomp/stompjs`)
- 하나의 Frontend 프로젝트에서 `/kiosk`, `/staff` 분리

### Backend

- Spring Boot
- Spring Web
- Spring Data JPA
- Spring WebSocket
- STOMP
- DB: H2 / MySQL / PostgreSQL 중 팀 합의

### Realtime

- WebSocket Endpoint: `/ws`
- Subscribe: `/topic/sessions/{sessionId}`

---

## 5. 권장 5인 역할

| 역할 | 주요 책임 |
|---|---|
| Integration / Infra Lead | 저장소 세팅, 공통 계약 관리, 통합, 환경변수, 배포, E2E, 최종 QA |
| Frontend A | `/kiosk` 예매 UI, Easy Mode, 단계 진행 |
| Frontend B | `/staff` 이어받기 UI, Session 수정, WebSocket UI 반영 |
| Backend A | Session CRUD, Transfer Code, 조회/Claim |
| Backend B | 상태 전이, WebSocket/STOMP, DB/예외 처리 |

> 역할명은 권장안입니다. 실제 팀원 이름은 [`docs/TEAM.md`](docs/TEAM.md)에 작성합니다.

---

## 6. 저장소 구조

```text
kiobridge/
├── README.md
├── docs/
│   ├── TEAM.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT_FLOW.md
│   ├── API_CONTRACT.md
│   ├── FRONTEND_GUIDE.md
│   ├── BACKEND_GUIDE.md
│   ├── GIT_WORKFLOW.md
│   ├── INTEGRATION_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── TEST_SCENARIO.md
│   └── DEFINITION_OF_DONE.md
│
├── frontend/
│   └── README.md
│
├── backend/
│   └── README.md
│
└── .github/
    ├── PULL_REQUEST_TEMPLATE.md
    └── ISSUE_TEMPLATE/
        ├── feature.md
        └── bug.md
```

실제 프로젝트 생성 후:

```text
frontend/
  src/
    pages/
      kiosk/
      staff/
    components/
    api/
    types/
    mocks/

backend/
  src/main/java/.../
    session/
    websocket/
    common/
```

---

## 7. 로컬 실행 규약

팀 전체가 아래 규약을 맞춥니다.

| 항목 | 기본값 |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| REST Base URL | `/api/v1` |
| WebSocket | `/ws` |
| Kiosk Route | `/kiosk` |
| Staff Route | `/staff` |

Frontend는 Backend URL을 코드에 직접 박지 않습니다.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=http://localhost:8080
```

Backend도 허용 Origin을 코드 곳곳에 직접 작성하지 말고 설정값으로 관리합니다.

---

## 8. 개발 원칙

### 원칙 1 — Frontend와 Backend는 API Contract를 기준으로 병렬 개발한다

프론트는 백엔드가 끝날 때까지 기다리지 않습니다.

`docs/API_CONTRACT.md`에 정의된 JSON을 기준으로 Mock Data를 만들어 UI를 개발합니다.

백엔드도 프론트 구현을 기다리지 않고 같은 계약을 기준으로 API를 구현합니다.

### 원칙 2 — Contract 변경은 반드시 공유한다

다음 항목 변경은 임의로 하지 않습니다.

- URL
- HTTP Method
- Request Field
- Response Field
- Enum
- WebSocket Topic
- Event Type

변경이 필요하면 `docs/API_CONTRACT.md`를 먼저 수정하고 팀에 공유합니다.

### 원칙 3 — `main`은 항상 시연 가능한 상태를 유지한다

직접 push하지 않습니다.

```text
feature branch
   ↓
Pull Request
   ↓
develop
   ↓
Integration Test
   ↓
main
   ↓
Deploy
```

### 원칙 4 — 통합 담당자가 다른 팀원 코드를 다시 작성하지 않게 한다

각 기능 담당자는 자신의 PR 안에서 최소한 아래까지 책임집니다.

- 빌드 성공
- 기본 예외 처리
- API Contract 준수
- 로컬 동작 확인
- README 또는 PR에 테스트 방법 기록

---

## 9. 가장 중요한 개발 순서

```text
[1] 화면 Mock 완성
      ↓
[2] Session REST 연결
      ↓
[3] Transfer Code 연결
      ↓
[4] Staff Session Restore
      ↓
[5] Staff Update / Complete
      ↓
[6] 전체 REST E2E 성공
      ↓
[7] WebSocket 연결
      ↓
[8] 배포
      ↓
[9] 배포 환경 E2E
```

**WebSocket부터 구현하지 않습니다.**

먼저 REST만으로 다음 테스트가 성공해야 합니다.

```text
Kiosk에서 예매
→ 도움 요청
→ 코드 발급
→ Staff에서 조회
→ Staff에서 좌석 선택
→ 완료
```

이후 실시간 동기화를 붙입니다.

---

## 10. 문서 읽는 순서

처음 참여하는 팀원은 다음 순서대로 읽습니다.

1. [`README.md`](README.md)
2. [`docs/TEAM.md`](docs/TEAM.md)
3. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
4. [`docs/TECH_STACK.md`](docs/TECH_STACK.md)
5. [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)
6. 자신의 파트 가이드
   - Frontend → [`docs/FRONTEND_GUIDE.md`](docs/FRONTEND_GUIDE.md) → [`frontend/README.md`](frontend/README.md)
   - Backend → [`docs/BACKEND_GUIDE.md`](docs/BACKEND_GUIDE.md)
7. [`docs/DEVELOPMENT_FLOW.md`](docs/DEVELOPMENT_FLOW.md)
8. [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md)

통합 담당자는 추가로:

9. [`docs/INTEGRATION_GUIDE.md`](docs/INTEGRATION_GUIDE.md)
10. [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md)
11. [`docs/TEST_SCENARIO.md`](docs/TEST_SCENARIO.md)

---

## 11. MVP 성공 기준

다음 한 흐름이 **배포 URL에서 실제로 동작하면 MVP Core가 성공한 것**으로 판단합니다.

```text
Kiosk
동서울 → 강릉 → 날짜 → 11:30 우등
        ↓
좌석 선택 화면
        ↓
도움받기
        ↓
6자리 코드 발급
        ↓
Staff
코드 입력
        ↓
같은 예매 상태 복원
        ↓
좌석 선택
        ↓
완료
        ↓
Kiosk
새로고침 없이 완료 화면으로 변경
```

세부 완료 기준은 [`docs/DEFINITION_OF_DONE.md`](docs/DEFINITION_OF_DONE.md)를 따릅니다.
