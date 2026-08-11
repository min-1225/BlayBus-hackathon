# TEAM

## 1. 팀 구성

5인 병렬 개발을 기본으로 합니다.

| Role | Name | Main Responsibility | Backup |
|---|---|---|---|
| Integration / Infra Lead | `작성` | 초기 세팅, Contract 관리, Integration, Deploy, E2E | 전체 |
| Frontend A | `작성` | Kiosk UI | Frontend B |
| Frontend B | `작성` | Staff UI / Realtime UI | Frontend A |
| Backend A | `작성` | Session / Transfer API | Backend B |
| Backend B | `작성` | WebSocket / State / DB | Backend A |

---

## 2. 담당 영역

### Integration / Infra Lead

처음:

- GitHub Repository 세팅
- Branch Rule 세팅
- Frontend/Backend 기본 Skeleton 준비
- `.env.example` 규약 정의
- API Contract 초안 작성
- 개발 문서 관리

중간:

- API Contract 변경 관리
- PR 통합
- CORS / 환경변수 문제 해결
- Frontend ↔ Backend 연결 확인
- WebSocket 최종 통합

마지막:

- Deployment
- Production Environment Variables
- E2E Test
- Demo 계정/데이터
- 발표 직전 Recovery Plan

### Frontend A — Kiosk

- `/kiosk`
- 목적지 선택
- 날짜 선택
- 시간/버스 선택
- 좌석 선택
- Easy Mode
- 진행 단계 UI
- 도움 요청
- Transfer Code 표시
- 완료 화면

### Frontend B — Staff

- `/staff`
- 6자리 코드 입력
- Session Restore
- 현재 단계 표시
- 좌석 선택/수정
- 완료 처리
- WebSocket Event 반영 UI

### Backend A — REST

- Session 생성
- Session 수정
- Transfer Code 생성
- Transfer Code 조회
- Claim API
- DTO / Validation

### Backend B — State / Realtime

- Session Status 전이
- Complete API
- WebSocket/STOMP
- 이벤트 발행
- DB Entity/Repository 보완
- Global Exception

---

## 3. 업무 경계

### Frontend가 Backend 내부 구현을 가정하지 않는다

Frontend는 오직 API Contract만 바라봅니다.

### Backend가 Frontend 화면 구조를 가정하지 않는다

Backend는 UI 상태가 아닌 Domain State를 반환합니다.

### Integration Lead는 Feature Owner가 아니다

통합 담당자의 역할은 **팀원 기능을 대신 구현하는 것**이 아니라 다음을 책임지는 것입니다.

- 계약 일치 여부
- 환경 연결
- Merge
- Integration bug
- Deployment
- E2E

각 파트 담당자는 자신의 기능 완성도를 PR 단계에서 책임집니다.
