export interface DateOption {
  value: string
  label: string
}

/** 고객용과 직원용 화면이 함께 사용하는 오늘부터 7일간의 출발 날짜 목록. */
export function createDateOptions(): DateOption[] {
  const weekday = ['일', '월', '화', '수', '목', '금', '토']
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)

    const value = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
    const relativeLabel = offset === 0 ? '오늘' : offset === 1 ? '내일' : ''
    const calendarLabel = `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday[date.getDay()]})`

    return { value, label: relativeLabel ? `${relativeLabel} · ${calendarLabel}` : calendarLabel }
  })
}
