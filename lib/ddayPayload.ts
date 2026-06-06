// 수정: Auto — 2026-06-05
import { INTERVAL_UNITS, type IntervalUnit } from '@/lib/ddaySchedule'
import { parseLastPurchaseDate } from '@/lib/shoppingDate'

const intervalUnitSet = new Set<string>(INTERVAL_UNITS)

export type DdayItemPayload = {
  name: string
  lastVisitDate: string
  intervalValue: number
  intervalUnit: IntervalUnit
}

export function parseDdayItemPayload(body: Record<string, unknown>): DdayItemPayload | null {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const lastVisitDate = parseLastPurchaseDate(body.lastVisitDate)
  const intervalValueRaw = Number(body.intervalValue)
  const intervalUnit = String(body.intervalUnit ?? '')

  if (!name) return null
  if (!lastVisitDate) return null
  if (!Number.isFinite(intervalValueRaw) || intervalValueRaw < 1) return null
  const intervalValue = Math.round(intervalValueRaw)
  if (intervalValue < 1 || intervalValue > 365) return null
  if (!intervalUnitSet.has(intervalUnit)) return null

  return {
    name,
    lastVisitDate,
    intervalValue,
    intervalUnit: intervalUnit as IntervalUnit,
  }
}
