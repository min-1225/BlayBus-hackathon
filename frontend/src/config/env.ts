/**
 * 환경변수를 읽는 유일한 지점.
 *
 * 페이지/컴포넌트에서 import.meta.env 를 직접 읽지 않는다.
 * 새 환경변수가 필요하면 여기에 추가하고 .env.example 에도 같이 적는다.
 */

/** REST Base URL. 개발 중에는 비어 있고, Vite Proxy 가 8080 으로 넘긴다. */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

/** WebSocket Base URL. 비어 있으면 현재 접속한 Origin 을 사용한다. */
export const WS_BASE_URL: string = import.meta.env.VITE_WS_BASE_URL ?? ''

/** true 면 MSW 가 가짜 Backend 역할을 한다. Backend 연동 시 false 로 바꾼다. */
export const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK === 'true'

/** 이 키오스크의 출발지. 데모에서는 동서울 고정. */
export const KIOSK_DEPARTURE: string = import.meta.env.VITE_KIOSK_DEPARTURE ?? '동서울'
