# GIT WORKFLOW

## 1. Branch

```text
main
develop
feat/*
fix/*
docs/*
chore/*
```

### main

항상 배포 가능 상태.

### develop

팀 통합 개발 Branch.

### feature

작업 단위 Branch.

예:

```text
feat/fe-kiosk-seat
feat/fe-staff-transfer
feat/be-session-api
feat/be-websocket
fix/transfer-code-404
docs/api-contract
```

---

## 2. 작업 시작

```bash
git checkout develop
git pull origin develop

git checkout -b feat/fe-kiosk-seat
```

---

## 3. Commit

권장 Prefix:

```text
feat:
fix:
refactor:
docs:
chore:
test:
```

예:

```text
feat: add kiosk seat selection page
feat: implement session transfer api
fix: handle invalid transfer code
docs: update websocket event contract
```

한 Commit에 Frontend/Backend/문서 여러 주제를 무리하게 섞지 않습니다.

---

## 4. Pull Request

모든 Feature는:

```text
feature branch → develop
```

직접 `main`으로 보내지 않습니다.

PR에는 반드시:

- 무엇을 구현했는지
- 테스트 방법
- 관련 API
- 화면 변경
- Contract 변경 여부
- 남은 이슈

를 작성합니다.

---

## 5. Merge Rule

권장:

- 최소 1명 확인
- Build 실패 시 Merge 금지
- API Contract 불일치 시 Merge 금지
- Conflict 해결 후 담당자가 다시 Test

해커톤이라도 `main` 직접 Push는 피합니다.

---

## 6. API Contract 변경

PR 제목 또는 Description:

```text
[API CHANGE]
```

를 표시합니다.

그리고 반드시:

```text
docs/API_CONTRACT.md
```

도 같이 수정합니다.

---

## 7. Integration Lead Merge 원칙

Integration Lead는 PR을 받을 때 최소 확인:

```text
[ ] Build 성공
[ ] Contract 일치
[ ] env 하드코딩 없음
[ ] 기존 기능 깨지지 않음
[ ] 테스트 방법 존재
```

통합 담당자가 모든 기능을 직접 Debug해야 하는 상태로 PR을 넘기지 않습니다.
