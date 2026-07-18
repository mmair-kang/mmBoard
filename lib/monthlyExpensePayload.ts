// 수정: Auto — 2026-07-19 03:40 (보험 계약상세)
// 수정: Auto — 2026-07-19 03:30 (국민연금 고지서형)
// 수정: Auto — 2026-07-19 03:15 (건보 고지서형 상세)
// 수정: Auto — 2026-07-19 03:15 (통신비 타입·상세)
// 수정: Auto — 2026-06-08

import {
  healthInsuranceDetailForDb,
  healthInsuranceGrandTotal,
  parseHealthInsuranceDetail,
  type HealthInsuranceDetail,
} from '@/lib/healthInsuranceDetail'
import {
  insuranceDetailForDb,
  insuranceGrandTotal,
  parseInsuranceDetail,
  type InsuranceDetail,
} from '@/lib/insuranceExpenseDetail'
import { monthlyDayToDb, normalizeMonthlyDayFromDb } from '@/lib/monthlyDayLabel'
import {
  nationalPensionDetailForDb,
  nationalPensionGrandTotal,
  parseNationalPensionDetail,
  type NationalPensionDetail,
} from '@/lib/nationalPensionDetail'
import {
  hasExpenseDetailType,
  hasSectionExpenseDetailType,
  isValidMonthlyExpenseType,
  parseTelecomDetail,
  telecomDetailForDb,
  telecomGrandTotal,
  type MonthlyExpenseType,
  type TelecomDetail,
} from '@/lib/telecomExpenseDetail'

export const MONTHLY_EXPENSE_PAY_TYPES = ['card', 'cash'] as const
export type MonthlyExpensePayType = (typeof MONTHLY_EXPENSE_PAY_TYPES)[number]

const payTypeSet = new Set<string>(MONTHLY_EXPENSE_PAY_TYPES)

export type MonthlyExpensePayload = {
  title: string
  dayOfMonth: number | null
  amount: number
  payType: MonthlyExpensePayType
  expenseType: MonthlyExpenseType
  telecomDetail: TelecomDetail | null
  healthInsuranceDetail: HealthInsuranceDetail | null
  nationalPensionDetail: NationalPensionDetail | null
  insuranceDetail: InsuranceDetail | null
}

export function monthlyExpenseDayForDb(dayOfMonth: number | null): number {
  return monthlyDayToDb(dayOfMonth)
}

export function expenseDetailJsonForDb(payload: MonthlyExpensePayload): string | null {
  if (payload.expenseType === 'healthInsurance') {
    return healthInsuranceDetailForDb(payload.healthInsuranceDetail)
  }
  if (payload.expenseType === 'nationalPension') {
    return nationalPensionDetailForDb(payload.nationalPensionDetail)
  }
  if (payload.expenseType === 'insurance') {
    return insuranceDetailForDb(payload.insuranceDetail)
  }
  if (hasSectionExpenseDetailType(payload.expenseType)) {
    return telecomDetailForDb(payload.telecomDetail)
  }
  return null
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

  const payType = String(body.payType ?? '')
  if (!payTypeSet.has(payType)) return null

  const expenseTypeRaw = body.expenseType ?? 'none'
  if (!isValidMonthlyExpenseType(expenseTypeRaw)) return null
  const expenseType = expenseTypeRaw

  let telecomDetail: TelecomDetail | null = null
  let healthInsuranceDetail: HealthInsuranceDetail | null = null
  let nationalPensionDetail: NationalPensionDetail | null = null
  let insuranceDetail: InsuranceDetail | null = null

  if (expenseType === 'healthInsurance') {
    healthInsuranceDetail = parseHealthInsuranceDetail(body.healthInsuranceDetail ?? body.telecomDetail)
    if (!healthInsuranceDetail) return null
  } else if (expenseType === 'nationalPension') {
    nationalPensionDetail = parseNationalPensionDetail(body.nationalPensionDetail ?? body.telecomDetail)
    if (!nationalPensionDetail) return null
  } else if (expenseType === 'insurance') {
    insuranceDetail = parseInsuranceDetail(body.insuranceDetail ?? body.telecomDetail)
    if (!insuranceDetail) return null
  } else if (hasSectionExpenseDetailType(expenseType)) {
    telecomDetail = parseTelecomDetail(body.telecomDetail)
    if (!telecomDetail) return null
  }

  let amount = Math.round(Number(body.amount))
  if (expenseType === 'healthInsurance' && healthInsuranceDetail) {
    amount = healthInsuranceGrandTotal(healthInsuranceDetail)
  } else if (expenseType === 'nationalPension' && nationalPensionDetail) {
    amount = nationalPensionGrandTotal(nationalPensionDetail)
  } else if (expenseType === 'insurance' && insuranceDetail) {
    amount = insuranceGrandTotal(insuranceDetail)
  } else if (hasSectionExpenseDetailType(expenseType) && telecomDetail) {
    amount = telecomGrandTotal(telecomDetail)
  }
  if (!Number.isFinite(amount) || amount < 1) return null

  return {
    title,
    dayOfMonth,
    amount,
    payType: payType as MonthlyExpensePayType,
    expenseType,
    telecomDetail: hasSectionExpenseDetailType(expenseType) ? telecomDetail : null,
    healthInsuranceDetail: expenseType === 'healthInsurance' ? healthInsuranceDetail : null,
    nationalPensionDetail: expenseType === 'nationalPension' ? nationalPensionDetail : null,
    insuranceDetail: expenseType === 'insurance' ? insuranceDetail : null,
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

export { telecomDetailForDb, hasExpenseDetailType }
