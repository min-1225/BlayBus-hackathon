import { BrowserRouter, Route, Routes } from 'react-router'
import HomePage from '@/pages/HomePage'
import { KioskSessionProvider } from '@/session/KioskSessionProvider'
import DestinationPage from '@/pages/kiosk/DestinationPage'
import DatePage from '@/pages/kiosk/DatePage'
import SchedulePage from '@/pages/kiosk/SchedulePage'
import SeatPage from '@/pages/kiosk/SeatPage'
import ConfirmationPage from '@/pages/kiosk/ConfirmationPage'
import PaymentPage from '@/pages/kiosk/PaymentPage'
import HelpPage from '@/pages/kiosk/HelpPage'
import TransferPage from '@/pages/kiosk/TransferPage'
import KioskCompletePage from '@/pages/kiosk/KioskCompletePage'
import TransferLookupPage from '@/pages/staff/TransferLookupPage'
import SessionDetailPage from '@/pages/staff/SessionDetailPage'
import StaffCompletePage from '@/pages/staff/StaffCompletePage'
import NotFoundPage from '@/pages/NotFoundPage'

/**
 * 라우팅 표.
 *
 * 새 화면을 추가할 때는 여기에 Route 를 먼저 등록하고 페이지 파일을 만든다.
 * 주소를 직접 치고 들어가도 동작해야 한다(FRONTEND_GUIDE §10).
 *
 * Kiosk 는 KioskSessionProvider 안에서만 동작한다.
 * Staff 는 세션을 코드로 조회하므로 Provider 가 필요 없다.
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/kiosk/*"
          element={
            <KioskSessionProvider>
              <Routes>
                <Route index element={<DestinationPage />} />
                <Route path="date" element={<DatePage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="seat" element={<SeatPage />} />
                <Route path="confirm" element={<ConfirmationPage />} />
                <Route path="payment" element={<PaymentPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="transfer" element={<TransferPage />} />
                <Route path="complete" element={<KioskCompletePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </KioskSessionProvider>
          }
        />

        <Route path="/staff" element={<TransferLookupPage />} />
        <Route path="/staff/sessions/:sessionId" element={<SessionDetailPage />} />
        <Route path="/staff/sessions/:sessionId/complete" element={<StaffCompletePage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
