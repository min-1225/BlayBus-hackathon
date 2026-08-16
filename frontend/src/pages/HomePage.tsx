import { Link } from 'react-router'

export default function HomePage() {
  return (
    <div className="bg-surface-muted min-h-dvh px-5 py-10">
      <main className="bg-surface border-line mx-auto max-w-5xl rounded-xl border p-7 lg:p-12">
        <header className="border-line mb-10 border-b pb-6">
          <p className="text-kiosk-label text-brand-strong font-bold tracking-wide">
            KIOBRIDGE BUS
          </p>
          <h1 className="text-kiosk-title mt-3 font-bold">이용하실 서비스를 선택하세요</h1>
          <p className="text-kiosk-body text-muted mt-3">
            고객 예매와 직원 업무 화면을 구분했습니다.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            to="/kiosk"
            className="border-brand bg-brand-soft hover:bg-brand flex min-h-64 flex-col justify-between rounded-xl border-2 p-8 transition-colors hover:text-white"
          >
            <span className="text-kiosk-label font-bold">고객용</span>
            <span>
              <strong className="text-kiosk-title block">버스표 예매</strong>
              <span className="text-kiosk-body mt-3 block">노선부터 결제 완료까지 진행합니다.</span>
            </span>
            <span className="text-kiosk-body font-bold">예매 시작 →</span>
          </Link>

          <Link
            to="/staff"
            className="bg-surface border-line hover:border-brand flex min-h-64 flex-col justify-between rounded-xl border-2 p-8 transition-colors"
          >
            <span className="text-kiosk-label text-muted font-bold">직원용</span>
            <span>
              <strong className="text-kiosk-title block">예매 이어받기</strong>
              <span className="text-kiosk-body text-muted mt-3 block">
                6자리 번호로 고객 예매를 지원합니다.
              </span>
            </span>
            <span className="text-kiosk-body text-brand-strong font-bold">직원 화면 열기 →</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
