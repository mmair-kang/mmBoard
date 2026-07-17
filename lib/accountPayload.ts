// 수정: Auto — 2026-07-18 01:35 (성남사랑 잔액 파싱)

import { isMonthlyAnytimeDay, monthlyDayToDb } from '@/lib/monthlyDayLabel'

export type AccountPayload = {
  name: string
  balance?: number
  outflows?: OutflowPayload[]
}

export type OutflowPayload = {
  id?: number
  dayOfMonth: number | null
  title: string
  amount: number
}

export type OutflowProgressPayload = {
  switchOn?: boolean
}

export function parseOutflowDayValue(value: unknown): number | null | undefined {
  if (value === null || value === '' || value === undefined) return null
  const day = Math.round(Number(value))
  if (!Number.isFinite(day)) return undefined
  if (isMonthlyAnytimeDay(day)) return null
  if (day < 1 || day > 31) return undefined
  return day
}

export function outflowDayForDb(dayOfMonth: number | null): number {
  return monthlyDayToDb(dayOfMonth)
}

export function parseOutflowPayload(value: unknown): OutflowPayload | null {
  if (!value || typeof value !== 'object') return null
  const body = value as Record<string, unknown>
  if (!('dayOfMonth' in body)) return null
  const dayOfMonth = parseOutflowDayValue(body.dayOfMonth)
  if (dayOfMonth === undefined) return null

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const amount = Math.round(Number(body.amount))
  if (!title) return null
  if (!Number.isFinite(amount) || amount < 1) return null

  const idRaw = body.id
  const id = idRaw != null ? Math.round(Number(idRaw)) : undefined
  if (id != null && (!Number.isFinite(id) || id < 1)) return null

  return { id, dayOfMonth, title, amount }
}

export function parseOutflowsPayload(body: Record<string, unknown>): OutflowPayload[] | null {
  if (!('outflows' in body)) return []
  if (!Array.isArray(body.outflows)) return null
  const parsed: OutflowPayload[] = []
  for (const row of body.outflows) {
    const item = parseOutflowPayload(row)
    if (!item) return null
    parsed.push(item)
  }
  return parsed
}

export function parseAccountPayload(body: Record<string, unknown>): AccountPayload | null {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return null

  const payload: AccountPayload = { name }

  if ('balance' in body) {
    const balance = Math.round(Number(body.balance))
    if (!Number.isFinite(balance)) return null
    payload.balance = balance
  }

  if ('outflows' in body) {
    const outflows = parseOutflowsPayload(body)
    if (outflows === null) return null
    payload.outflows = outflows
  }

  return payload
}

export function parseAccountBalancePayload(body: Record<string, unknown>): number | null {
  if (!('balance' in body)) return null
  const balance = Math.round(Number(body.balance))
  if (!Number.isFinite(balance)) return null
  return balance
}

export function parseSeongnamLoveBalancePayload(body: Record<string, unknown>): number | null {
  if (!('seongnamLoveBalance' in body)) return null
  const balance = Math.round(Number(body.seongnamLoveBalance))
  if (!Number.isFinite(balance)) return null
  return balance
}

export function parseOutflowProgressPayload(body: Record<string, unknown>): OutflowProgressPayload | null {
  if (!('switchOn' in body)) return null
  return { switchOn: Boolean(body.switchOn) }
}
