import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * 키오스크 표준 버튼.
 *
 * 고령 사용자를 위해 최소 터치 높이(h-touch)를 강제한다.
 * 화면마다 버튼을 새로 만들지 말고 이 컴포넌트를 쓴다.
 */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong',
  secondary: 'bg-surface text-ink border-2 border-line hover:border-brand',
  ghost: 'bg-transparent text-muted hover:text-ink',
  danger: 'bg-danger text-white hover:opacity-90',
}

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** 주요 CTA 는 더 크게 (h-touch-lg). */
  size?: 'md' | 'lg'
  children: ReactNode
}

export function BigButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: BigButtonProps) {
  const height = size === 'lg' ? 'h-touch-lg text-kiosk-title' : 'h-touch text-kiosk-body'

  return (
    <button
      className={`${height} ${VARIANT_CLASS[variant]} w-full rounded-2xl px-6 font-bold transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
