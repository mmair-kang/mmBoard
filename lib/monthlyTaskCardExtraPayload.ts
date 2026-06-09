// 수정: Auto — 2026-06-08

import { isMonthlyAnytimeDay, monthlyDayToDb } from '@/lib/monthlyDayLabel'

export const CARD_EXTRA_TYPES = ['scheduled', 'payment_switch'] as const
export type CardExtraType = (typeof CARD_EXTRA_TYPES)[number]

const extraTypeSet = new Set<string>(CARD_EXTRA_TYPES)

export type CardExtraPayload = {
  id?: number
  extraType: CardExtraType
  title: string | null
  dayOfMonth: number | null
  amount: number
}

export type CardExtraProgressPayload = {
  checked?: boolean
  switchOn?: boolean
}

export function parseCardExtraDay(value: unknown): number | null | undefined {
  if (value === null || value === '' || value === undefined) return null
  const day = Math.round(Number(value))
  if (!Number.isFinite(day)) return undefined
  if (isMonthlyAnytimeDay(day)) return null
  if (day < 1 || day > 31) return undefined
  return day
}

export function parseCardExtraPayload(value: unknown): CardExtraPayload | null {
  if (!value || typeof value !== 'object') return null
  const body = value as Record<string, unknown>

  let extraType = String(body.extraType ?? 'payment_switch')
  if (!extraTypeSet.has(extraType)) extraType = 'payment_switch'

  if (!('dayOfMonth' in body)) return null
  const dayOfMonth = parseCardExtraDay(body.dayOfMonth)
  if (dayOfMonth === undefined) return null

  const amount = Math.round(Number(body.amount))
  if (!Number.isFinite(amount) || amount < 1) return null

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return null

  const idRaw = body.id
  const id = idRaw != null ? Math.round(Number(idRaw)) : undefined
  if (id != null && (!Number.isFinite(id) || id < 1)) return null

  return {
    id,
    extraType: 'payment_switch',
    title,
    dayOfMonth,
    amount,
  }
}

export function cardExtraDayForDb(dayOfMonth: number | null): number {
  return monthlyDayToDb(dayOfMonth)
}

export function parseCardExtrasPayload(body: Record<string, unknown>): CardExtraPayload[] | null {
  if (!('cardExtras' in body)) return []
  if (!Array.isArray(body.cardExtras)) return null
  const parsed: CardExtraPayload[] = []
  for (const row of body.cardExtras) {
    const item = parseCardExtraPayload(row)
    if (!item) return null
    parsed.push(item)
  }
  return parsed
}

export function parseCardExtraProgressPayload(
  body: Record<string, unknown>,
): CardExtraProgressPayload | null {
  const payload: CardExtraProgressPayload = {}
  if ('checked' in body) payload.checked = Boolean(body.checked)
  if ('switchOn' in body) payload.switchOn = Boolean(body.switchOn)
  if (payload.checked === undefined && payload.switchOn === undefined) return null
  return payload
}
