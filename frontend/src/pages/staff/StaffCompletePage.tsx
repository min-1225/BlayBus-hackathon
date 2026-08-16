import { Link, useParams } from 'react-router'
import { StaffLayout } from './StaffLayout'

/**
 * 직원 완료 확인 화면.
 *
 * TODO(Frontend B): completeSession(id) 호출 결과를 보여주고,
 * 고객 키오스크 화면이 자동으로 완료 처리되었음을 직원에게 알린다.
 *
 * 참고 구현: TransferLookupPage.tsx
 */
export default function StaffCompletePage() {
  const { sessionId } = useParams()

  return (
    <StaffLayout title="예매 완료" subtitle={`세션 #${sessionId}`}>
      <p className="text-success mb-6 text-2xl font-bold">✓ 처리되었습니다</p>
      <p className="text-muted mb-8">고객님 키오스크 화면이 자동으로 완료 화면으로 바뀝니다.</p>

      <Link
        to="/staff"
        className="bg-brand hover:bg-brand-strong inline-block rounded-lg px-6 py-4 font-bold text-white transition-colors"
      >
        다음 고객 응대
      </Link>
    </StaffLayout>
  )
}
