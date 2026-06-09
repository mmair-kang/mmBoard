// 수정: Auto — 2026-06-08
import dayjs from 'dayjs'

import { isMonthlyAnytimeDay } from '@/lib/monthlyDayLabel'

export function currentYear(): string {
  return dayjs().format('YYYY')
}

export function formatAnnualDueLabel(month: number, dayOfMonth: number | null | undefined): string {
  if (dayOfMonth == null || isMonthlyAnytimeDay(dayOfMonth)) return `${month}월`
  if (dayOfMonth === 31) return `${month}월 말일`
  return `${month}월 ${dayOfMonth}일`
}

export function annualDayToDb(dayOfMonth: number | null | undefined): number | null {
  if (dayOfMonth == null || isMonthlyAnytimeDay(dayOfMonth)) return null
  return dayOfMonth
}

export function annualDayFromDb(dayOfMonth: number | null | undefined): number | null {
  if (dayOfMonth == null || isMonthlyAnytimeDay(dayOfMonth)) return null
  return dayOfMonth
}

export function annualDueSortKey(month: number, dayOfMonth: number | null): number {
  const day = dayOfMonth ?? 0
  return month * 100 + day
}
