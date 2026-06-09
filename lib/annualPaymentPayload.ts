// 수정: Auto — 2026-06-08

import { annualDayToDb } from '@/lib/annualPaymentLabel'
import { parseOutflowDayValue } from '@/lib/accountPayload'

export type AnnualPaymentPayload = {
  id?: number
  title: string
  month: number
  dayOfMonth: number | null
  amount: number
}

export type AnnualPaymentProgressPayload = {
  switchOn?: boolean
}

export function parseAnnualPaymentMonth(value: unknown): number | undefined {
  const month = Math.round(Number(value))
  if (!Number.isFinite(month) || month < 1 || month > 12) return undefined
  return month
}

export function parseAnnualPaymentPayload(value: unknown): AnnualPaymentPayload | null {
  if (!value || typeof value !== 'object') return null
  const body = value as Record<string, unknown>

  const month = parseAnnualPaymentMonth(body.month)
  if (month === undefined) return null

  let dayOfMonth: number | null = null
  if ('dayOfMonth' in body && body.dayOfMonth !== null && body.dayOfMonth !== '') {
    const day = parseOutflowDayValue(body.dayOfMonth)
    if (day === undefined) return null
    dayOfMonth = day
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const amount = Math.round(Number(body.amount))
  if (!title) return null
  if (!Number.isFinite(amount) || amount < 1) return null

  const idRaw = body.id
  const id = idRaw != null ? Math.round(Number(idRaw)) : undefined
  if (id != null && (!Number.isFinite(id) || id < 1)) return null

  return { id, title, month, dayOfMonth, amount }
}

export function parseAnnualPaymentsPayload(body: Record<string, unknown>): AnnualPaymentPayload[] | null {
  if (!('payments' in body)) return []
  if (!Array.isArray(body.payments)) return null
  const parsed: AnnualPaymentPayload[] = []
  for (const row of body.payments) {
    const item = parseAnnualPaymentPayload(row)
    if (!item) return null
    parsed.push(item)
  }
  return parsed
}

export function annualPaymentDayForDb(dayOfMonth: number | null): number | null {
  return annualDayToDb(dayOfMonth)
}

export function parseAnnualPaymentProgressPayload(
  body: Record<string, unknown>,
): AnnualPaymentProgressPayload | null {
  if (!('switchOn' in body)) return null
  return { switchOn: Boolean(body.switchOn) }
}
