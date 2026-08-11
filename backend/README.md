# Backend

Spring Boot 단일 Application을 사용합니다.

구현 전 반드시 읽기:

1. `../docs/API_CONTRACT.md`
2. `../docs/BACKEND_GUIDE.md`
3. `../docs/GIT_WORKFLOW.md`

## 기본 규약

```text
PORT=8080
REST=/api/v1
WebSocket=/ws
Topic=/topic/sessions/{sessionId}
```

## 구현 순서

```text
Session
→ Update
→ Transfer
→ Restore
→ Claim
→ Complete
→ WebSocket
```

WebSocket보다 REST E2E를 먼저 완료합니다.
