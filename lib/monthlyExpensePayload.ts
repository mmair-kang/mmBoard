// 수정: Auto — 2026-06-08

import { monthlyDayToDb, normalizeMonthlyDayFromDb } from '@/lib/monthlyDayLabel'

export const MONTHLY_EXPENSE_PAY_TYPES = ['card', 'cash'] as const
export type MonthlyExpensePayType = (typeof MONTHLY_EXPENSE_PAY_TYPES)[number]

const payTypeSet = new Set<string>(MONTHLY_EXPENSE_PAY_TYPES)

export type MonthlyExpensePayload = {
  title: string
  dayOfMonth: number | null
  amount: number
  payType: MonthlyExpensePayType
}

export function monthlyExpenseDayForDb(dayOfMonth: number | null): number {
  return monthlyDayToDb(dayOfMonth)
}

export function parseMonthlyExpensePayload(body: Record<string, unknown>): MonthlyExpensePayload | null {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return null

  let dayOfMonth: number | null = null
  if (body.dayOfMonth != null && body.dayOfMonth !== '') {
    const day = Math.round(Number(body.dayOfMonth))
    if (!Number.isFinite(day) || day < 1 || day > 31) return null
    dayOfMonth = day
  }

  const amount = Math.round(Number(body.amount))
  if (!Number.isFinite(amount) || amount < 1) return null

  const payType = String(body.payType ?? '')
  if (!payTypeSet.has(payType)) return null

  return {
    title,
    dayOfMonth,
    amount,
    payType: payType as MonthlyExpensePayType,
  }
}

export function normalizeMonthlyExpenseDayFromDb(dayOfMonth: number): number | null {
  return normalizeMonthlyDayFromDb(dayOfMonth)
}

export function parseMonthlyExpenseOrder(body: Record<string, unknown>): number[] | null {
  if (!Array.isArray(body.order) || body.order.length === 0) return null
  const ids: number[] = []
  const seen = new Set<number>()

  for (const id of body.order) {
    if (typeof id !== 'number' || !Number.isFinite(id) || seen.has(id)) return null
    seen.add(id)
    ids.push(id)
  }

  return ids
}
