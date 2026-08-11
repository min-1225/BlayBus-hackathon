# DEVELOPMENT FLOW

## 목표

5명이 서로 기다리지 않고 병렬 개발하고, 마지막에 Integration Lead가 안정적으로 합칠 수 있도록 하는 개발 흐름입니다.

---

# Phase 0 — Repository / Contract Setup

담당: Integration Lead

## 완료 조건

- `main`, `develop` branch
- Frontend Skeleton
- Backend Skeleton
- `.env.example`
- API Contract
- Mock Data 형식
- Git 규칙
- PR Template
- 문서 업로드

이 단계에서는 기능을 완성하려고 하지 않습니다.

**팀원이 자기 파트를 바로 시작할 수 있는 최소한의 공통 기반만 만듭니다.**

---

# Phase 1 — Frontend / Backend 병렬 개발

## Frontend

Backend가 없어도 진행합니다.

```text
API Contract
   ↓
Mock Response
   ↓
화면
   ↓
상태 관리
   ↓
API Adapter
```

예:

```ts
// mock
const session = {
  id: 123,
  status: "WAITING",
  currentStep: "SEAT_SELECTION",
  destination: "강릉"
}
```

프론트 담당자는 실제 API가 연결되기 전까지 위 Mock으로 화면을 완성합니다.

## Backend

Frontend가 없어도 진행합니다.

```text
API Contract
   ↓
DTO
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
curl/Postman Test
```

---

# Phase 2 — REST Integration

담당: Integration Lead + 해당 Feature Owner

먼저 WebSocket을 제외하고 전체 흐름을 연결합니다.

```text
POST Session
 ↓
PATCH Session
 ↓
POST Transfer
 ↓
GET Transfer
 ↓
POST Claim
 ↓
PATCH Session
 ↓
POST Complete
```

## Integration 순서

### 1. Session 생성

Kiosk가 예매 시작 시 Session을 생성할 수 있어야 합니다.

### 2. Session 저장

목적지/날짜/시간/좌석 등 의미 있는 단계가 끝날 때 상태를 저장합니다.

### 3. Transfer

도움받기 클릭 시 서버에서 6자리 코드를 발급합니다.

### 4. Restore

Staff에서 6자리 코드로 Session을 불러옵니다.

### 5. Claim

직원이 이어받기를 시작합니다.

### 6. Update

직원이 좌석 등 남은 정보를 입력합니다.

### 7. Complete

직원이 예매 완료를 처리합니다.

---

# Phase 3 — WebSocket Integration

REST E2E가 완료된 이후 진행합니다.

```text
Kiosk
   ↓ connect
/ws
   ↓ subscribe
/topic/sessions/{sessionId}
```

Backend가 Complete 처리 후:

```text
SESSION_COMPLETED
```

이벤트를 발행합니다.

Kiosk는 이 이벤트를 받고 완료 화면으로 전환합니다.

---

# Phase 4 — Deployment Integration

1. Backend 먼저 배포
2. Backend Public URL 확인
3. Frontend Environment에 Backend URL 입력
4. Frontend 배포
5. CORS 확인
6. HTTPS/WebSocket 확인
7. Production E2E

---

# Phase 5 — Demo Freeze

발표 직전에는 신규 기능 추가보다 안정성을 우선합니다.

Freeze 이후 허용:

- 치명적 버그 수정
- 문구 수정
- Demo Data 수정
- UI 깨짐 수정

Freeze 이후 금지 권장:

- DB 전환
- 인증 추가
- API 구조 대변경
- 새로운 상태 추가
- 신규 라이브러리 대규모 도입

---

# Daily Development Rule

각 팀원은 작업 시작 시 Issue를 하나 선택합니다.

```text
Issue
 ↓
Feature Branch
 ↓
개발
 ↓
Self Test
 ↓
Commit
 ↓
PR → develop
 ↓
Review
 ↓
Merge
```

작업 완료 후 Blaybus에도 진행 기록을 남깁니다.

---

# 하루 단위 권장 목표

## Day 1

- Skeleton
- UI Mock
- Entity/DTO/API Skeleton

## Day 2

- Kiosk 주요 화면
- Session CRUD

## Day 3

- Staff 화면
- Transfer/Claim

## Day 4

- REST E2E
- WebSocket

## Day 5

- Deploy
- E2E
- QA
- 발표 Demo 고정
