# DEPLOYMENT GUIDE

> 특정 클라우드 서비스에 종속되지 않는 배포 체크리스트입니다.

## 1. 배포 순서

```text
Database
 ↓
Backend
 ↓
Backend URL 확인
 ↓
Frontend env 설정
 ↓
Frontend
 ↓
WebSocket 확인
 ↓
E2E
```

---

## 2. Frontend Environment

```env
VITE_API_BASE_URL=https://BACKEND_URL
VITE_WS_BASE_URL=https://BACKEND_URL
```

코드에 배포 URL을 직접 쓰지 않습니다.

---

## 3. Backend Environment

권장 환경변수:

```text
PORT
DB_URL
DB_USERNAME
DB_PASSWORD
ALLOWED_ORIGINS
TRANSFER_TTL_MINUTES
```

환경별 비밀번호를 GitHub에 Commit하지 않습니다.

---

## 4. `.env.example`

실제 값 없이 Key만 공유합니다.

예:

```env
VITE_API_BASE_URL=
VITE_WS_BASE_URL=
```

---

## 5. Production CORS

Frontend 배포 URL을 정확히 허용합니다.

예:

```text
https://frontend.example.com
```

`*` 허용은 Demo 편의상 쓸 수 있더라도 최종적으로는 명시 Origin을 권장합니다.

---

## 6. HTTPS / WebSocket

Frontend가 HTTPS면 WebSocket도 보통 secure 연결을 고려해야 합니다.

Browser Console에서 다음 확인:

- Mixed Content
- WebSocket handshake
- CORS
- 404 Endpoint

---

## 7. 배포 후 Smoke Test

### Frontend

```text
/kiosk 접속
/staff 접속
직접 URL Refresh
```

### Backend

```text
Session 생성
Transfer 발급
Transfer 조회
Claim
Complete
```

### WebSocket

Staff Complete → Kiosk 자동 완료.

---

## 8. Demo Data

실제 운행정보라고 주장하지 않는 Mock Data를 사용합니다.

예:

```text
동서울 → 강릉
11:30
우등
좌석 7
```

발표 자료에는 필요 시:

```text
※ 본 운행 정보와 결제 과정은 MVP 시연용 데이터입니다.
```

표기.

---

## 9. Secret 관리

Commit 금지:

```text
.env
application-prod.yml
DB Password
Private Key
Token
```

`.gitignore` 확인.

---

## 10. Final Deployment Checklist

```text
[ ] Frontend Production URL
[ ] Backend Production URL
[ ] DB 연결
[ ] CORS
[ ] REST
[ ] WebSocket
[ ] Mobile Staff
[ ] Desktop Kiosk
[ ] Demo Data
[ ] 발표용 코드 고정
[ ] QR 없이도 Demo 가능
```
