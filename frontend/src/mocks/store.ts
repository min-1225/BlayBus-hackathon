import type { Session } from '@/types/session'

/**
 * Mock Backend 의 저장소.
 *
 * localStorage 를 쓰는 이유:
 * 데모는 "키오스크 탭"과 "직원 탭"을 동시에 띄운다.
 * 메모리에만 두면 두 탭이 서로 다른 세션을 보게 되어 이어받기 시나리오가 성립하지 않는다.
 * localStorage 는 같은 Origin 의 모든 탭이 공유하므로 실제 서버처럼 동작한다.
 *
 * 이 파일은 Backend 연동 후에는 실행되지 않는다.
 */

const STORAGE_KEY = 'kiobridge:mock:sessions'
const SEQ_KEY = 'kiobridge:mock:seq'

type SessionTable = Record<string, Session>

function readTable(): SessionTable {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessionTable) : {}
  } catch {
    return {}
  }
}

function writeTable(table: SessionTable): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(table))
}

function nextId(): number {
  const current = Number(localStorage.getItem(SEQ_KEY) ?? '100')
  const id = current + 1
  localStorage.setItem(SEQ_KEY, String(id))
  return id
}

function now(): string {
  return new Date().toISOString().slice(0, 19)
}

export function insertSession(departure: string): Session {
  const session: Session = {
    id: nextId(),
    status: 'ACTIVE',
    currentStep: 'DESTINATION',
    departure,
    destination: null,
    travelDate: null,
    departureTime: null,
    busGrade: null,
    seatNo: null,
    transferCode: null,
    createdAt: now(),
    updatedAt: now(),
  }

  const table = readTable()
  table[session.id] = session
  writeTable(table)
  return session
}

export function findSession(sessionId: number): Session | undefined {
  return readTable()[sessionId]
}

export function findSessionByCode(code: string): Session | undefined {
  return Object.values(readTable()).find((s) => s.transferCode === code)
}

export function saveSession(session: Session): Session {
  const updated: Session = { ...session, updatedAt: now() }
  const table = readTable()
  table[updated.id] = updated
  writeTable(table)
  return updated
}

/** 6자리 숫자 코드. 이미 사용 중인 코드는 피한다. */
export function issueTransferCode(): string {
  const table = readTable()
  const used = new Set(Object.values(table).map((s) => s.transferCode))

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const code = String(Math.floor(100000 + Math.random() * 900000))
    if (!used.has(code)) return code
  }

  throw new Error('mock: transfer code 발급 실패')
}

/** 개발 중 상태를 초기화하고 싶을 때 사용한다. */
export function resetStore(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(SEQ_KEY)
}
