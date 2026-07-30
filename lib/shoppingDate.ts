// 수정: Auto — 2026-07-31 00:05 (재구매일·D-day)
// 수정: Auto — 2026-06-15

import dayjs from 'dayjs'
import { formatRelativeDayKo } from '@/lib/relativeDayLabel'
import { formatTodoDday } from '@/lib/todoFormat'

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** DB 저장용 YYYY-MM-DD */
export function parseLastPurchaseDate(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!ISO_DATE_RE.test(trimmed)) return null
  return trimmed
}

/** 화면 표시용 YY-MM-DD */
export function formatLastPurchaseDateDisplay(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null
  const match = ISO_DATE_RE.exec(isoDate)
  if (!match) return isoDate
  return `${match[1].slice(-2)}-${match[2]}-${match[3]}`
}

/** 목록 표시용 — 오늘·N일 전 */
export function formatLastPurchaseRelativeLabel(isoDate: string | null | undefined): string | null {
  return formatRelativeDayKo(isoDate)
}

/** 구매일 + 재구매 주기 → 다음 재구매일 (YYYY-MM-DD) */
export function calcNextRepurchaseIso(
  purchaseDate: string | null | undefined,
  repurchaseDays: number | null | undefined,
): string | null {
  if (!purchaseDate || repurchaseDays == null || repurchaseDays < 1) return null
  if (!ISO_DATE_RE.test(purchaseDate.trim())) return null
  return dayjs(purchaseDate).add(repurchaseDays, 'day').format('YYYY-MM-DD')
}

/** 상시 목록용 — 재구매일 표시 + D-N / TODAY / D+N */
export function formatRepurchaseSchedule(
  purchaseDate: string | null | undefined,
  repurchaseDays: number | null | undefined,
): { dateLabel: string; ddayLabel: string; daysRemaining: number } | null {
  const nextIso = calcNextRepurchaseIso(purchaseDate, repurchaseDays)
  if (!nextIso) return null
  const dateLabel = formatLastPurchaseDateDisplay(nextIso)
  if (!dateLabel) return null
  const daysRemaining = dayjs(nextIso).startOf('day').diff(dayjs().startOf('day'), 'day')
  const ddayLabel = formatTodoDday(daysRemaining)
  if (!ddayLabel) return null
  return { dateLabel, ddayLabel, daysRemaining }
}

export function todayIsoDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}