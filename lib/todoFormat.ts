// 수정: Auto — 2026-06-15 (로컬 날짜 D-day·TODAY 표기)

import dayjs, { type Dayjs } from 'dayjs'

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** ISO 날짜만 있을 때 UTC 파싱으로 하루 밀리는 문제 방지 */
function parseTodoLocalDate(dueDate: string): Dayjs {
  const match = ISO_DATE_RE.exec(dueDate)
  if (!match) return dayjs(dueDate).startOf('day')
  return dayjs()
    .year(Number(match[1]))
    .month(Number(match[2]) - 1)
    .date(Number(match[3]))
    .startOf('day')
}

function parseTodoLocalDateTime(dueDate: string, dueTime: string): Dayjs {
  const [hh = '0', mm = '0'] = dueTime.split(':')
  return parseTodoLocalDate(dueDate).hour(Number(hh)).minute(Number(mm)).second(0).millisecond(0)
}

export function formatTodoDueDateLabel(dueDate: string | null | undefined): string | null {
  if (!dueDate) return null
  const match = ISO_DATE_RE.exec(dueDate)
  if (!match) return dueDate
  return `${Number(match[2])}/${Number(match[3])}`
}

export function calcTodoDueDays(dueDate: string | null, dueTime: string | null): number | null {
  if (!dueDate) return null
  const today = dayjs().startOf('day')
  if (dueTime) {
    return parseTodoLocalDateTime(dueDate, dueTime).startOf('day').diff(today, 'day')
  }
  return parseTodoLocalDate(dueDate).diff(today, 'day')
}

export function formatTodoDday(days: number | null): string | null {
  if (days == null) return null
  if (days === 0) return 'TODAY'
  if (days > 0) return `D-${days}`
  return `D+${Math.abs(days)}`
}

export function todoDueSortKey(dueDate: string | null, dueTime: string | null): string | null {
  if (!dueDate && !dueTime) return null
  const date = dueDate ?? '9999-12-31'
  const time = dueTime ?? '99:99'
  return `${date}T${time}`
}

export function sortTodoItems<T extends { dueDate: string | null; dueTime: string | null; createdAt: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aKey = todoDueSortKey(a.dueDate, a.dueTime)
    const bKey = todoDueSortKey(b.dueDate, b.dueTime)
    if (aKey == null && bKey == null) {
      return b.createdAt.localeCompare(a.createdAt)
    }
    if (aKey == null) return 1
    if (bKey == null) return -1
    const byDue = aKey.localeCompare(bKey)
    if (byDue !== 0) return byDue
    return a.createdAt.localeCompare(b.createdAt)
  })
}
