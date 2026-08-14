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

---

## 11. 구체 배포 절차 (Supabase + Render + Vercel)

> 실제 백엔드 구현(`feat/be-deploy-config`)에 맞춘 절차입니다. 아래 **환경변수 이름은 코드와 정확히 일치**하며,
> 비밀값은 각 대시보드에만 입력하고 Git 에는 남기지 않습니다.

### 실제 사용하는 환경변수 (코드 기준)

Backend(Render):

```text
SPRING_PROFILES_ACTIVE=prod          # render.yaml 에 이미 설정됨
SPRING_DATASOURCE_URL                 # jdbc:postgresql://<host>:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME            # postgres.<project-ref>
SPRING_DATASOURCE_PASSWORD            # Supabase DB 비밀번호
APP_CORS_ALLOWED_ORIGINS             # https://<app>.vercel.app  (쉼표로 여러 개 가능)
PORT                                  # Render 가 자동 주입 (app 은 ${PORT} 에 바인딩)
```

Frontend(Vercel):

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://<backend>.onrender.com
VITE_WS_BASE_URL=https://<backend>.onrender.com
VITE_KIOSK_DEPARTURE=동서울
```

> 참고: Transfer Code 유효시간은 현재 코드에서 15분으로 고정입니다(env 미연동). 변경이 필요하면
> `SessionService.TRANSFER_TTL` 을 수정하거나, 추후 env 로 뺄 수 있습니다.

### Step 1 — Supabase (DB)

1. supabase.com → **New project** 생성. DB **Password** 를 정하고 보관.
2. 프로젝트 → **Connect** → **Session pooler** 정보를 사용한다.
   - Render 는 IPv4 아웃바운드이므로 **Session Pooler(포트 5432)** 를 쓴다. Direct(IPv6 전용)·Transaction Pooler(6543, JDBC 부적합)는 피한다.
   - Host `aws-0-<region>.pooler.supabase.com`, User `postgres.<project-ref>`, Password(위에서 정한 값)

### Step 2 — Render (Backend)

1. `feat/be-deploy-config` 를 **develop 에 머지** (Render 가 `render.yaml` 을 읽으려면 대상 브랜치에 있어야 함).
2. render.com → **New → Blueprint** → 저장소 연결 → `render.yaml` 자동 인식 → `kiobridge-backend` 생성.
3. **Environment** 에 시크릿 입력:
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` = `postgres.<project-ref>`
   - `SPRING_DATASOURCE_PASSWORD` = (Supabase DB 비밀번호)
   - `APP_CORS_ALLOWED_ORIGINS` = 임시로 `http://localhost:5173` (Vercel URL 나오면 교체)
4. Deploy → 헬스체크 `/api/v1/schedules?destination=ping` 200 확인 → URL 메모(`https://kiobridge-backend.onrender.com`).

### Step 3 — Vercel (Frontend)

1. vercel.com → **New Project** → 저장소 import → **Root Directory = `frontend`** (Framework: Vite 자동 감지).
2. **Environment Variables** 에 위 Frontend 변수 4개 입력(백엔드 URL 반영).
3. Deploy → URL 메모(`https://<app>.vercel.app`).

### Step 4 — CORS 마무리 + 검증

1. Render 로 돌아가 `APP_CORS_ALLOWED_ORIGINS` = `https://<app>.vercel.app` (끝 슬래시 없이)로 교체 후 재시작.
2. `https://<app>.vercel.app/kiosk` + `/staff` 두 탭으로 풀 플로우 실행 → 키오스크 자동 완료 확인.
3. 브라우저 콘솔에서 Mixed Content / CORS / WebSocket handshake 에러 없는지 확인
   (프론트가 https→wss 자동 변환하므로 정상).

### 주의점

- Render 무료 티어는 15분 유휴 후 슬립 → 첫 요청 콜드스타트 30~60초. **발표 직전 URL 한 번 열어 예열**.
- Supabase 는 **Session Pooler(5432)** 사용. 영속 DB 이므로 재배포·재시작해도 세션이 유지된다.
- Docker 이미지는 JDK21 멀티스테이지 빌드(`backend/Dockerfile`)로 프로젝트 toolchain 과 동일 버전을 보장.
