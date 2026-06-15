// 수정: Auto — 2026-06-15 (로컬 날짜·상대 표기)

import dayjs from 'dayjs'

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

function parseRelativeDayBase(iso: string) {
  const match = ISO_DATE_RE.exec(iso)
  if (match) {
    return dayjs()
      .year(Number(match[1]))
      .month(Number(match[2]) - 1)
      .date(Number(match[3]))
      .startOf('day')
  }
  return dayjs(iso).startOf('day')
}

/** ISO 날짜·시각 기준 — 오늘·N일 전 */
export function formatRelativeDayKo(iso: string | null | undefined): string | null {
  if (!iso) return null
  const days = dayjs().startOf('day').diff(parseRelativeDayBase(iso), 'day')
  if (days <= 0) return '오늘'
  return `${days}일 전`
}
