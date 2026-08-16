import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-8 text-center">
      <p className="text-kiosk-title font-bold">페이지를 찾을 수 없습니다</p>
      <div className="flex gap-4">
        <Link to="/kiosk" className="text-brand-strong text-kiosk-body font-bold underline">
          키오스크
        </Link>
        <Link to="/staff" className="text-brand-strong text-kiosk-body font-bold underline">
          직원 화면
        </Link>
      </div>
    </div>
  )
}
