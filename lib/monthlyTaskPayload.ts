// 수정: Auto — 2026-06-08

import type { CardExtraPayload } from '@/lib/monthlyTaskCardExtraPayload'
import { parseCardExtrasPayload } from '@/lib/monthlyTaskCardExtraPayload'

export const MONTHLY_TASK_OPTION_TYPES = ['card_target', 'switch'] as const
export type MonthlyTaskOptionType = (typeof MONTHLY_TASK_OPTION_TYPES)[number]

const optionTypeSet = new Set<string>(MONTHLY_TASK_OPTION_TYPES)

export type MonthlyTaskPayload = {
  title: string
  dayOfMonth: number | null
  optionType: MonthlyTaskOptionType
  targetAmount: number | null
  cardExtras?: CardExtraPayload[]
}

export type ParsedMonthlyTaskPayload = MonthlyTaskPayload & {
  cardExtras: CardExtraPayload[]
}

export type MonthlyTaskProgressPayload = {
  currentAmount?: number
  switchOn?: boolean
}

export function parseMonthlyTaskPayload(body: Record<string, unknown>): ParsedMonthlyTaskPayload | null {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const optionType = String(body.optionType ?? '')

  if (!title) return null
  if (!optionTypeSet.has(optionType)) return null

  let dayOfMonth: number | null = null
  if (body.dayOfMonth != null && body.dayOfMonth !== '') {
    const day = Math.round(Number(body.dayOfMonth))
    if (!Number.isFinite(day) || day < 1 || day > 31) return null
    dayOfMonth = day
  }

  let targetAmount: number | null = null
  if (optionType === 'card_target') {
    const raw = Number(body.targetAmount)
    if (!Number.isFinite(raw) || raw < 1) return null
    targetAmount = Math.round(raw)
  }

  const cardExtras = parseCardExtrasPayload(body)
  if (cardExtras === null) return null
  if (optionType !== 'card_target' && cardExtras.length > 0) return null

  return {
    title,
    dayOfMonth,
    optionType: optionType as MonthlyTaskOptionType,
    targetAmount,
    cardExtras,
  }
}

export function parseMonthlyTaskProgressPayload(
  body: Record<string, unknown>,
): MonthlyTaskProgressPayload | null {
  const payload: MonthlyTaskProgressPayload = {}

  if ('currentAmount' in body) {
    const raw = Number(body.currentAmount)
    if (!Number.isFinite(raw) || raw < 0) return null
    payload.currentAmount = Math.round(raw)
  }

  if ('switchOn' in body) {
    payload.switchOn = Boolean(body.switchOn)
  }

  if (payload.currentAmount === undefined && payload.switchOn === undefined) return null
  return payload
}
