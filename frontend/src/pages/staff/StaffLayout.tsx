import type { ReactNode } from 'react'

/**
 * 직원 화면 공통 껍데기.
 *
 * 키오스크와 달리 직원 화면은 모바일에서도 써야 한다(MVP SHOULD).
 * max-w-2xl + 반응형 패딩으로 좁은 화면에서도 깨지지 않게 한다.
 */
export function StaffLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-dvh">
      <header className="bg-surface border-line border-b px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-brand text-sm font-bold tracking-wide">KioBridge · 직원</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-muted mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  )
}
