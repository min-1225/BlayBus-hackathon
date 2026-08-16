import { useNavigate } from 'react-router'
import { BigButton } from '@/components/BigButton'
import { KioskLayout } from '@/components/KioskLayout'
import { useKioskSession } from '@/session/kioskSessionContext'
import { STEP_LABEL } from '@/types/session'

/**
 * 도움받기 — 지금까지 고른 내용을 확인하고 이어하기 번호를 발급받는다.
 *
 * "처음부터 다시 하지 않아도 된다"를 사용자에게 납득시키는 화면이므로
 * 선택한 내용을 반드시 그대로 보여준다.
 */
export default function HelpPage() {
  const navigate = useNavigate()
  const { session, requestTransfer, isLoading } = useKioskSession()

  const rows = [
    { label: '가는 곳', value: session?.destination },
    { label: '날짜', value: session?.travelDate },
    { label: '출발 시간', value: session?.departureTime },
    {
      label: '버스',
      value: session?.busGrade ? (session.busGrade === 'PREMIUM' ? '우등' : '일반') : null,
    },
    { label: '좌석', value: session?.seatNo },
  ]

  async function askForHelp() {
    const transfer = await requestTransfer()
    if (transfer) navigate('/kiosk/transfer')
  }

  return (
    <KioskLayout
      step={session?.currentStep ?? 'DESTINATION'}
      question="지금까지 고르신 내용이에요"
      showHelp={false}
    >
      <dl className="bg-surface-muted border-line mb-8 divide-y rounded-lg border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-6 py-5">
            <dt className="text-kiosk-body text-muted">{row.label}</dt>
            <dd className="text-kiosk-body font-bold">
              {row.value ? (
                <span className="text-ink">{row.value}</span>
              ) : (
                <span className="text-muted">아직 선택 안 함</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {session && (
        <p className="text-kiosk-body text-muted mb-8">
          지금 <strong className="text-ink">{STEP_LABEL[session.currentStep]}</strong> 단계까지
          오셨어요. 여기까지 그대로 저장해 드릴게요.
        </p>
      )}

      <div className="flex flex-col gap-4">
        <BigButton size="lg" onClick={askForHelp} disabled={!session || isLoading}>
          {isLoading ? '저장하는 중...' : '여기까지 저장하고 도움받기'}
        </BigButton>
        <BigButton variant="ghost" onClick={() => navigate(-1)} disabled={isLoading}>
          계속 혼자 해볼게요
        </BigButton>
      </div>
    </KioskLayout>
  )
}
