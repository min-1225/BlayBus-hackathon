import type { ReactNode } from 'react'

/**
 * Loading / Error / Empty 상태를 위한 공용 컴포넌트.
 *
 * PR 최소 기준(docs/FRONTEND_GUIDE.md §10)에 세 상태 처리가 포함되어 있다.
 * 화면마다 따로 만들지 말고 이걸 쓴다.
 */

export function LoadingView({ message = '불러오는 중입니다' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16" role="status" aria-live="polite">
      <span className="border-line border-t-brand size-12 animate-spin rounded-full border-4" />
      <p className="text-kiosk-body text-muted">{message}</p>
    </div>
  )
}

export function ErrorView({
  message,
  onRetry,
  children,
}: {
  message: string
  onRetry?: () => void
  children?: ReactNode
}) {
  return (
    <div
      className="border-danger/30 bg-danger/5 flex flex-col items-start gap-4 rounded-2xl border-2 p-6"
      role="alert"
    >
      <p className="text-kiosk-body text-danger font-bold">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-kiosk-label text-brand-strong font-bold underline underline-offset-4"
        >
          다시 시도
        </button>
      )}
      {children}
    </div>
  )
}

export function EmptyView({ message }: { message: string }) {
  return (
    <div className="border-line rounded-2xl border-2 border-dashed py-16 text-center">
      <p className="text-kiosk-body text-muted">{message}</p>
    </div>
  )
}
