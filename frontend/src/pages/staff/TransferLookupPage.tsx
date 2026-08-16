import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { StaffLayout } from './StaffLayout'
import { getSessionByTransferCode } from '@/api/sessionApi'
import { toUserMessage } from '@/api/http'
import { ErrorView } from '@/components/StatusView'

/**
 * 이어하기 번호 조회 — Staff 화면의 참고 구현.
 *
 * 보여주는 패턴:
 *   1. API 호출은 api/sessionApi 만 사용
 *   2. 오류는 toUserMessage 로 한국어 문구로 변환
 *   3. 요청 중 버튼 비활성화
 *
 * 조회만 하고 Claim 은 다음 화면에서 한다.
 * (직원이 번호를 잘못 입력했을 때 남의 세션을 CLAIMED 로 만들지 않기 위함)
 */
export default function TransferLookupPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function lookup(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const session = await getSessionByTransferCode(code)
      navigate(`/staff/sessions/${session.id}`)
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <StaffLayout title="이어하기 번호 조회" subtitle="고객님 화면에 표시된 6자리 번호를 입력하세요">
      <form onSubmit={lookup} className="space-y-5">
        <div>
          <label htmlFor="transfer-code" className="mb-2 block font-bold">
            이어하기 번호
          </label>
          <input
            id="transfer-code"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="border-line focus:border-brand w-full rounded-lg border px-5 py-4 text-center text-4xl font-bold tracking-[0.3em] tabular-nums outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={code.length !== 6 || isLoading}
          className="bg-brand hover:bg-brand-strong w-full rounded-lg py-4 text-xl font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? '조회하는 중...' : '예매 불러오기'}
        </button>

        {error && <ErrorView message={error} />}
      </form>
    </StaffLayout>
  )
}
