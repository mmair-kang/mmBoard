// 수정: Auto — 2026-07-12 23:36
import dayjs from 'dayjs'

import { parseLastPurchaseDate } from '@/lib/shoppingDate'

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

export const CARD_APPLICATION_DATE_PICKER_FORMAT = 'YY. M. D (ddd)'

export function formatCardApplicationDateLabel(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null
  const parsed = parseLastPurchaseDate(isoDate)
  if (!parsed) return null
  const date = dayjs(parsed)
  if (!date.isValid()) return null
  const yy = date.format('YY')
  const month = date.month() + 1
  const day = date.date()
  const weekday = WEEKDAY_KO[date.day()]
  return `${yy}. ${month}. ${day} (${weekday})`
}

export function formatCardApplicationDateRangeLabel(
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  const startLabel = formatCardApplicationDateLabel(start)
  const endLabel = formatCardApplicationDateLabel(end)
  if (startLabel && endLabel) return `${startLabel} ~ ${endLabel}`
  return startLabel ?? endLabel
}
