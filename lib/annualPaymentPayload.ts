// 수정: Auto — 2026-07-19 16:05 (결제방식·카드)
// 수정: Auto — 2026-07-19 16:00 (네이버플러스 멤버십)
// 수정: Auto — 2026-07-19 15:10 (Cursor PRO)
// 수정: Auto — 2026-07-19 14:40 (연납 타입·자동차보험)
// 수정: Auto — 2026-06-08

import { annualDayToDb } from '@/lib/annualPaymentLabel'
import {
  hasAnnualPaymentDetailType,
  isValidAnnualPaymentPayType,
  isValidAnnualPaymentType,
  type AnnualPaymentPayType,
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
import {
  naverPlusAnnualDetailForDb,
  naverPlusAnnualGrandTotal,
  parseNaverPlusAnnualDetail,
  type NaverPlusAnnualDetail,
} from '@/lib/naverPlusAnnualDetail'

export type AnnualPaymentPayload = {
  id?: number
  title: string
  month: number
  dayOfMonth: number | null
  amount: number
  paymentType: AnnualPaymentType
  payType: AnnualPaymentPayType
  monthlyTaskId: number | null
  carInsuranceDetail: CarInsuranceAnnualDetail | null
  cursorProDetail: CursorProAnnualDetail | null
  naverPlusDetail: NaverPlusAnnualDetail | null
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
  if (payload.paymentType === 'naverPlus') {
    return naverPlusAnnualDetailForDb(payload.naverPlusDetail)
  }
  return null
}

function parseMonthlyTaskId(value: unknown): number | null | undefined {
  if (value == null || value === '') return null
  const id = Math.round(Number(value))
  if (!Number.isFinite(id) || id < 1) return undefined
  return id
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

  const payTypeRaw = body.payType ?? 'card'
  if (!isValidAnnualPaymentPayType(payTypeRaw)) return null
  const payType = payTypeRaw

  const monthlyTaskIdParsed = parseMonthlyTaskId(body.monthlyTaskId)
  if (monthlyTaskIdParsed === undefined) return null
  const monthlyTaskId = payType === 'card' ? monthlyTaskIdParsed : null

  let carInsuranceDetail: CarInsuranceAnnualDetail | null = null
  let cursorProDetail: CursorProAnnualDetail | null = null
  let naverPlusDetail: NaverPlusAnnualDetail | null = null

  if (paymentType === 'carInsurance') {
    carInsuranceDetail = parseCarInsuranceAnnualDetail(
      body.carInsuranceDetail ?? body.detailJson,
    )
    if (!carInsuranceDetail) return null
  } else if (paymentType === 'cursorPro') {
    cursorProDetail = parseCursorProAnnualDetail(body.cursorProDetail ?? body.detailJson)
    if (!cursorProDetail) return null
  } else if (paymentType === 'naverPlus') {
    naverPlusDetail = parseNaverPlusAnnualDetail(body.naverPlusDetail ?? body.detailJson)
    if (!naverPlusDetail) return null
  }

  let amount = Math.round(Number(body.amount))
  if (paymentType === 'carInsurance' && carInsuranceDetail) {
    amount = carInsuranceAnnualGrandTotal(carInsuranceDetail)
  } else if (paymentType === 'cursorPro' && cursorProDetail) {
    amount = cursorProAnnualGrandTotal(cursorProDetail)
  } else if (paymentType === 'naverPlus' && naverPlusDetail) {
    amount = naverPlusAnnualGrandTotal(naverPlusDetail)
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
    payType,
    monthlyTaskId,
    carInsuranceDetail: paymentType === 'carInsurance' ? carInsuranceDetail : null,
    cursorProDetail: paymentType === 'cursorPro' ? cursorProDetail : null,
    naverPlusDetail: paymentType === 'naverPlus' ? naverPlusDetail : null,
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
