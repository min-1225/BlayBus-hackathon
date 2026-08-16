import { createContext, use } from 'react'
import type { Session, SessionPatch, TransferResponse } from '@/types/session'

/**
 * Kiosk 예매 세션 Context.
 *
 * Provider 구현은 KioskSessionProvider.tsx 에 있다.
 * Context 객체와 Hook 만 이 파일에 두는 이유는 Fast Refresh 경고를 피하기 위해서다
 * (컴포넌트 파일은 컴포넌트만 export 해야 한다).
 */

export interface KioskSessionValue {
  /** 아직 세션을 만들지 않았으면 null. */
  session: Session | null
  /** 서버 요청이 진행 중인지. 버튼 비활성화/스피너에 사용한다. */
  isLoading: boolean
  /** 사용자에게 보여줄 오류 문구. 없으면 null. */
  error: string | null

  /** 예매 시작 — 세션이 없으면 생성한다. 이미 있으면 그대로 반환한다. */
  start: () => Promise<Session | null>
  /** 선택값 저장 — 서버 PATCH 후 로컬 상태를 갱신한다. */
  patch: (patch: SessionPatch) => Promise<Session | null>
  /** 도움받기 — 6자리 코드를 발급받는다. */
  requestTransfer: () => Promise<TransferResponse | null>
  /** 고객 결제 완료 — 선택한 예매를 최종 완료한다. */
  completeBooking: () => Promise<Session | null>
  /** 서버에서 최신 세션을 다시 읽는다. WebSocket 이벤트 수신 시 사용한다. */
  refresh: () => Promise<Session | null>
  /** 처음부터 다시 — 데모를 반복 실행할 때 사용한다. */
  reset: () => void
  /** 오류 문구 지우기. */
  clearError: () => void
}

export const KioskSessionContext = createContext<KioskSessionValue | null>(null)

export function useKioskSession(): KioskSessionValue {
  const value = use(KioskSessionContext)

  if (!value) {
    throw new Error('useKioskSession 은 <KioskSessionProvider> 안에서만 사용할 수 있습니다.')
  }

  return value
}
