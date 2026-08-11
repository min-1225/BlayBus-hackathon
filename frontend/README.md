# Frontend

Frontend는 하나의 React Application 안에서 두 화면을 제공합니다.

```text
/kiosk
/staff
```

구현 전 반드시 읽기:

1. `../docs/API_CONTRACT.md`
2. `../docs/FRONTEND_GUIDE.md`
3. `../docs/GIT_WORKFLOW.md`

## Environment

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=http://localhost:8080
```

## 개발 원칙

- Backend 완성을 기다리지 않고 Mock으로 개발
- JSON 구조는 API Contract와 동일하게 유지
- localhost URL 직접 하드코딩 금지
- `/kiosk`와 `/staff`의 공통 타입/컴포넌트는 재사용
