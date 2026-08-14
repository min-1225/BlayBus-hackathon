import { STEP_LABEL, STEP_SEQUENCE, type BookingStep } from '@/types/session'

/**
 * Easy Mode 진행 표시.
 *
 *   ① 목적지  ② 날짜  ③ 시간  ④ 좌석 ← 지금 여기  ⑤ 확인  ⑥ 결제
 *
 * "지금 어디까지 왔는지"를 항상 보여주는 것이 이 프로젝트의 핵심 UX다.
 */

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥']

export function StepIndicator({ current }: { current: BookingStep }) {
  const currentIndex = STEP_SEQUENCE.indexOf(current)

  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="예매 진행 단계">
      {STEP_SEQUENCE.map((step, index) => {
        const isDone = currentIndex > index
        const isCurrent = currentIndex === index

        return (
          <li
            key={step}
            aria-current={isCurrent ? 'step' : undefined}
            className={[
              'text-kiosk-label flex items-center gap-1 rounded-full px-3 py-1 font-semibold',
              isCurrent && 'bg-brand text-white',
              isDone && 'bg-brand-soft text-brand-strong',
              !isCurrent && !isDone && 'text-muted',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span aria-hidden>{isDone ? '✓' : CIRCLED[index]}</span>
            <span>{STEP_LABEL[step]}</span>
            {isCurrent && <span className="sr-only">지금 진행 중</span>}
          </li>
        )
      })}
    </ol>
  )
}
