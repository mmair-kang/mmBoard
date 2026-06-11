// 수정: Auto — 2026-06-05
import dayjs, { type Dayjs } from 'dayjs'

export const INTERVAL_UNITS = ['day', 'week', 'month'] as const
export type IntervalUnit = (typeof INTERVAL_UNITS)[number]

export const INTERVAL_UNIT_LABELS: Record<IntervalUnit, string> = {
  day: '일',
  week: '주',
  month: '달',
}

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

export function calcNextVisitDate(
  lastVisitDate: string,
  intervalValue: number,
  intervalUnit: IntervalUnit,
): Dayjs {
  const base = dayjs(lastVisitDate)
  if (intervalUnit === 'day') return base.add(intervalValue, 'day')
  if (intervalUnit === 'week') return base.add(intervalValue, 'week')
  return base.add(intervalValue, 'month')
}

export function calcCycleDays(lastVisitDate: string, nextVisitDate: string): number {
  return Math.max(1, dayjs(nextVisitDate).diff(dayjs(lastVisitDate), 'day'))
}

export function calcDaysElapsed(lastVisitDate: string, today = dayjs()): number {
  return Math.max(0, today.startOf('day').diff(dayjs(lastVisitDate).startOf('day'), 'day'))
}

export function calcDaysRemaining(nextVisitDate: string, today = dayjs()): number {
  return Math.max(0, dayjs(nextVisitDate).startOf('day').diff(today.startOf('day'), 'day'))
}

export function calcProgressFilled(lastVisitDate: string, nextVisitDate: string, today = dayjs()) {
  const total = calcCycleDays(lastVisitDate, nextVisitDate)
  const elapsed = calcDaysElapsed(lastVisitDate, today)
  return Math.min(total, elapsed)
}

export function formatNextVisitLabel(nextVisitDate: string): string {
  const d = dayjs(nextVisitDate)
  const yy = String(d.year()).slice(-2)
  const mm = String(d.month() + 1).padStart(2, '0')
  const dd = String(d.date()).padStart(2, '0')
  const wd = WEEKDAY_KO[d.day()]
  return `${yy}-${mm}-${dd} (${wd})`
}

export function formatNextVisitCompact(nextVisitDate: string): string {
  const d = dayjs(nextVisitDate)
  return `${d.month() + 1}/${d.date()}(${WEEKDAY_KO[d.day()]})`
}
