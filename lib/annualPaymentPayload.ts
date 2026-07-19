// 수정: Auto — 2026-07-19 15:10 (Cursor PRO)
// 수정: Auto — 2026-07-19 14:40 (연납 타입·자동차보험)
// 수정: Auto — 2026-06-08

import { annualDayToDb } from '@/lib/annualPaymentLabel'
import {
  hasAnnualPaymentDetailType,
  isValidAnnualPaymentType,
  type AnnualPaymentType,
} from '@/lib/annualPaymentTypes'
import { parseOutflowDayValue } from '@/lib/accountPayload'
import {
  carInsuranceAnnualDetailForDb,
  carInsuranceAnnualGrandTotal,
  parseCarInsuranceAnnualDetail,
  type CarInsuranceAnnualDetail,
} from '@/lib/carInsuranceAnnualDetail'
import {
  cursorProAnnualDetailForDb,
  cursorProAnnualGrandTotal,
  parseCursorProAnnualDetail,
  type CursorProAnnualDetail,
} from '@/lib/cursorProAnnualDetail'

export type AnnualPaymentPayload = {
  id?: number
  title: string
  month: number
  dayOfMonth: number | null
  amount: number
  paymentType: AnnualPaymentType
  carInsuranceDetail: CarInsuranceAnnualDetail | null
  cursorProDetail: CursorProAnnualDetail | null
}

export type AnnualPaymentProgressPayload = {
  switchOn?: boolean
}

export function parseAnnualPaymentMonth(value: unknown): number | undefined {
  const month = Math.round(Number(value))
  if (!Number.isFinite(month) || month < 1 || month > 12) return undefined
  return month
}

export function annualDetailJsonForDb(payload: AnnualPaymentPayload): string | null {
  if (payload.paymentType === 'carInsurance') {
    return carInsuranceAnnualDetailForDb(payload.carInsuranceDetail)
  }
  if (payload.paymentType === 'cursorPro') {
    return cursorProAnnualDetailForDb(payload.cursorProDetail)
  }
  return null
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
  if (!title) return null

  const paymentTypeRaw = body.paymentType ?? 'none'
  if (!isValidAnnualPaymentType(paymentTypeRaw)) return null
  const paymentType = paymentTypeRaw

  let carInsuranceDetail: CarInsuranceAnnualDetail | null = null
  let cursorProDetail: CursorProAnnualDetail | null = null

  if (paymentType === 'carInsurance') {
    carInsuranceDetail = parseCarInsuranceAnnualDetail(
      body.carInsuranceDetail ?? body.detailJson,
    )
    if (!carInsuranceDetail) return null
  } else if (paymentType === 'cursorPro') {
    cursorProDetail = parseCursorProAnnualDetail(body.cursorProDetail ?? body.detailJson)
    if (!cursorProDetail) return null
  }

  let amount = Math.round(Number(body.amount))
  if (paymentType === 'carInsurance' && carInsuranceDetail) {
    amount = carInsuranceAnnualGrandTotal(carInsuranceDetail)
  } else if (paymentType === 'cursorPro' && cursorProDetail) {
    amount = cursorProAnnualGrandTotal(cursorProDetail)
  }
  if (!Number.isFinite(amount) || amount < 1) return null

  const idRaw = body.id
  const id = idRaw != null ? Math.round(Number(idRaw)) : undefined
  if (id != null && (!Number.isFinite(id) || id < 1)) return null

  return {
    id,
    title,
    month,
    dayOfMonth,
    amount,
    paymentType,
    carInsuranceDetail: paymentType === 'carInsurance' ? carInsuranceDetail : null,
    cursorProDetail: paymentType === 'cursorPro' ? cursorProDetail : null,
  }
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

export { hasAnnualPaymentDetailType }
