// 수정: Auto — 2026-06-08

/** DB/API에서 수시(이번 달 아무때나)를 나타내는 값 */
export const MONTHLY_ANYTIME_DAY = 0 as const

export function isMonthlyAnytimeDay(dayOfMonth: number | null | undefined): boolean {
  return dayOfMonth == null || dayOfMonth === MONTHLY_ANYTIME_DAY
}

export function formatMonthlyDayLabel(dayOfMonth: number | null | undefined): string {
  if (isMonthlyAnytimeDay(dayOfMonth)) return '수시'
  if (dayOfMonth === 31) return '말일'
  return `${dayOfMonth}일`
}

export function normalizeMonthlyDayFromDb(dayOfMonth: number | null | undefined): number | null {
  if (isMonthlyAnytimeDay(dayOfMonth)) return null
  return dayOfMonth!
}

export function monthlyDayToDb(dayOfMonth: number | null | undefined): number {
  if (isMonthlyAnytimeDay(dayOfMonth)) return MONTHLY_ANYTIME_DAY
  return dayOfMonth!
}

export const MONTHLY_DAY_SELECT_ANYTIME = 'anytime' as const

export function monthlyDayToSelectValue(dayOfMonth: number | null | undefined): string {
  if (isMonthlyAnytimeDay(dayOfMonth)) return MONTHLY_DAY_SELECT_ANYTIME
  return String(dayOfMonth)
}

export function monthlyDayFromSelectValue(value: string): number | null {
  if (value === MONTHLY_DAY_SELECT_ANYTIME) return null
  const day = Math.round(Number(value))
  if (!Number.isFinite(day) || day < 1 || day > 31) return null
  return day
}
