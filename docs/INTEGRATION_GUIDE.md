# INTEGRATION GUIDE

> Integration / Infra Lead용 문서

## 목표

Frontend와 Backend를 마지막에 억지로 붙이는 것이 아니라 **작은 단위로 점진 통합**합니다.

---

# 1. Integration 시작 전

체크:

```text
[ ] Frontend 로컬 실행
[ ] Backend 로컬 실행
[ ] API Contract 최신
[ ] Kiosk Mock Flow 완료
[ ] Staff Mock Flow 완료
[ ] Backend REST 개별 테스트 완료
```

---

# 2. Local Environment

Frontend:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=http://localhost:8080
```

Backend:

```text
server.port=8080
```

CORS:

```text
http://localhost:5173
```

---

# 3. Integration 순서

## Step 1 — Health Check

Frontend에서 Backend에 최소 요청 성공.

## Step 2 — Create Session

Kiosk 시작 → `POST /sessions`.

성공 시 Frontend에 `sessionId` 저장.

## Step 3 — Patch Session

목적지/날짜/시간 변경 후 Backend DB 확인.

## Step 4 — Transfer

도움 요청 버튼 → 6자리 코드.

## Step 5 — Staff Restore

직원 화면에서 코드 입력 → Kiosk 상태 그대로 확인.

## Step 6 — Claim

Staff가 이어받기 시작.

## Step 7 — Staff Update

좌석 번호 저장.

## Step 8 — Complete

Staff 완료.

여기까지 **REST만으로 정상 동작해야 합니다.**

---

# 4. WebSocket Integration

REST 완료 이후:

```text
Kiosk connect
 ↓
Subscribe
 ↓
Staff Complete
 ↓
Backend Publish
 ↓
Kiosk Receive
 ↓
Complete Page
```

Debug 포인트:

- WebSocket Handshake 성공 여부
- STOMP connect 성공 여부
- Topic 문자열 동일 여부
- `sessionId` 타입/값
- HTTPS 환경의 WSS 문제
- CORS/Allowed Origin

---

# 5. Integration 중 가장 자주 생기는 문제

## Enum 불일치

Frontend:

```text
SEAT
```

Backend:

```text
SEAT_SELECTION
```

→ Contract 문서가 source of truth.

## 필드명 불일치

Frontend:

```text
seat
```

Backend:

```text
seatNo
```

→ 하나로 통일.

## 날짜 형식 불일치

권장:

```text
YYYY-MM-DD
```

시간:

```text
HH:mm
```

## URL 하드코딩

Frontend 코드에 localhost가 있으면 배포 시 깨짐.

## WebSocket URL 혼동

REST URL과 WebSocket Endpoint 역할을 구분.

---

# 6. Integration Branch

작은 팀에서는 별도 장기 `integration` branch를 만들지 않는 것을 권장합니다.

```text
feat/*
  ↓
develop
  ↓
검증
  ↓
main
```

Integration Lead는 `develop`을 실제 통합 환경으로 사용합니다.

---

# 7. Merge to Main 기준

```text
[ ] Kiosk Flow 완료
[ ] Transfer Code 동작
[ ] Staff Restore 동작
[ ] Staff Update 동작
[ ] Complete 동작
[ ] WebSocket 완료 동작
[ ] Console Error 없음
[ ] Backend Error 없음
[ ] 새로고침 후 치명적 오류 없음
```

---

# 8. 발표 직전 Recovery Plan

WebSocket이 현장에서 실패해도 데모를 살릴 수 있도록 Staff 완료 후 Kiosk에 다음 fallback을 둘 수 있습니다.

- 일정 주기로 상태 재조회
- 또는 `완료 상태 확인` 버튼

단, 발표 기본 시나리오는 WebSocket 실시간 동기화로 보여줍니다.

QR도 실패할 수 있으므로 **6자리 직접 입력 기능은 반드시 유지**합니다.
