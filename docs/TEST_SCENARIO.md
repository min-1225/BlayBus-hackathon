# TEST SCENARIO

## 목적

심사위원이 보는 핵심 흐름을 그대로 테스트합니다.

---

# TC-01 Core Demo Flow

## Given

사용자가 `/kiosk`에 접속한다.

## When

1. 출발지: 동서울
2. 목적지: 강릉
3. 날짜 선택
4. 11:30
5. 우등
6. 좌석 선택 화면 이동
7. 도움받기
8. 6자리 코드 발급

## Then

Session 상태:

```text
WAITING
```

현재 단계:

```text
SEAT_SELECTION
```

이어하기 코드가 화면에 표시된다.

---

# TC-02 Staff Restore

Staff `/staff`에서 발급 코드 입력.

기대 결과:

```text
동서울
강릉
날짜
11:30
우등
좌석 미선택
현재 단계 = 좌석 선택
```

가 동일하게 복원된다.

---

# TC-03 Claim

직원이 이어받기.

기대:

```text
WAITING → CLAIMED
```

---

# TC-04 Staff Update

직원이 좌석 `7` 선택.

기대:

```text
seatNo = "7"
```

Backend에 저장.

---

# TC-05 Complete

직원이 완료 처리.

기대:

```text
CLAIMED → COMPLETED
```

---

# TC-06 Realtime

Staff에서 Complete 클릭 후 Kiosk를 새로고침하지 않는다.

기대:

```text
SESSION_COMPLETED event
```

수신.

Kiosk 화면:

```text
예매가 완료되었습니다.
강릉
오전 11:30
7번 좌석
```

---

# TC-07 Invalid Transfer Code

잘못된 코드:

```text
000000
```

기대:

사용자 친화적 오류 메시지.

---

# TC-08 Duplicate Claim

한 Staff가 이미 Claim한 Session을 다른 요청이 Claim.

기대:

```text
409
```

또는 팀에서 정한 일관된 정책.

---

# TC-09 Refresh

Kiosk/Staff 주요 화면에서 Refresh.

치명적인 흰 화면이 발생하지 않는지 확인.

---

# TC-10 Mobile Staff

스마트폰 크기에서 Staff 화면:

- 코드 입력 가능
- 세션 정보 읽을 수 있음
- 좌석 선택 가능
- 완료 버튼 사용 가능

---

# 발표 직전 E2E

최소 3회 연속 성공해야 합니다.

```text
Kiosk 시작
→ Transfer
→ Staff Restore
→ Claim
→ Seat
→ Complete
→ Realtime
```

한 번만 우연히 성공한 상태로 발표에 들어가지 않습니다.
