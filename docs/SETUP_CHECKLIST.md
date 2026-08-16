# SETUP CHECKLIST

> 초기 Repository 세팅 담당자용

## GitHub

```text
[ ] Repository 생성
[ ] main 생성
[ ] develop 생성
[ ] README 업로드
[ ] docs 업로드
[ ] PR Template
[ ] Issue Template
[ ] 팀원 Collaborator 초대
```

## Frontend Skeleton

```text
[x] React App 생성
[x] TypeScript 여부 확정
[x] Router 설치
[x] /kiosk route (전체 7개 화면)
[x] /staff route (전체 3개 화면)
[x] api 폴더 (http / sessionApi / websocket)
[x] types 폴더 (Contract 와 1:1)
[x] mocks 폴더 (MSW 가짜 Backend)
[x] .env.example
[x] npm run dev 성공
[x] npm run build 성공
```

## Frontend Pipeline

```text
[x] Styling 확정 — Tailwind CSS 4 + Easy Mode 토큰
[x] Mock 전략 확정 — MSW, VITE_USE_MOCK 로 전환
[x] 상태 관리 확정 — Context + useReducer (useKioskSession)
[x] Path Alias (@/)
[x] Vite Proxy — 로컬 CORS 불필요
[x] 공용 컴포넌트 — BigButton / KioskLayout / StepIndicator / StatusView
[x] 오류 문구 한국어 매핑 (api/http.ts)
[x] Prettier + ESLint
[x] npm run verify (typecheck + lint + format + build)
[x] Frontend CI 가 verify 와 동일 검사 수행
[x] 참고 구현 3개 — DestinationPage / TransferPage / TransferLookupPage
[ ] 팀원 각자 npm install + .env.local 생성 확인
```

## Backend Skeleton

```text
[ ] Spring Boot 생성
[ ] Spring Web
[ ] Spring Data JPA
[ ] Spring WebSocket
[ ] DB Driver
[ ] session package
[ ] websocket package
[ ] common package
[ ] 8080 실행
[ ] build 성공
```

## Contract

```text
[ ] API_CONTRACT 팀 공유
[ ] Enum 확정
[ ] Field name 확정
[ ] REST URL 확정
[ ] WS Endpoint 확정
[ ] Topic 확정
```

## 개발 시작 선언

위 항목 완료 후 팀원들에게:

```text
develop에서 최신 Pull
→ 자기 feature branch 생성
→ 담당 기능 개발
```

을 안내합니다.
