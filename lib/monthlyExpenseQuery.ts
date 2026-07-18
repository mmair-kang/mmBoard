// 수정: Auto — 2026-07-19 03:40 (보험 계약상세)
// 수정: Auto — 2026-07-19 03:30 (국민연금 고지서형)
// 수정: Auto — 2026-07-19 03:15 (건보 고지서형 상세)
// 수정: Auto — 2026-07-19 03:15 (통신비 타입·상세)
// 수정: Auto — 2026-06-08
import { asc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import {
  parseHealthInsuranceDetail,
  type HealthInsuranceDetail,
} from '@/lib/healthInsuranceDetail'
import {
  parseInsuranceDetail,
  type InsuranceDetail,
} from '@/lib/insuranceExpenseDetail'
import {
  expenseDetailJsonForDb,
  normalizeMonthlyExpenseDayFromDb,
  type MonthlyExpensePayload,
  monthlyExpenseDayForDb,
} from '@/lib/monthlyExpensePayload'
import { ensureMonthlyExpenseSchema } from '@/lib/monthlyExpenseSchema'
import {
  parseNationalPensionDetail,
  type NationalPensionDetail,
} from '@/lib/nationalPensionDetail'
import { monthlyFixedExpenses } from '@/lib/schema'
import {
  hasSectionExpenseDetailType,
  isValidMonthlyExpenseType,
  parseTelecomDetail,
  type MonthlyExpenseType,
  type TelecomDetail,
} from '@/lib/telecomExpenseDetail'

export type NormalizedMonthlyExpense = {
  id: number
  title: string
  dayOfMonth: number | null
  amount: number
  payType: 'card' | 'cash'
  expenseType: MonthlyExpenseType
  telecomDetail: TelecomDetail | null
  healthInsuranceDetail: HealthInsuranceDetail | null
  nationalPensionDetail: NationalPensionDetail | null
  insuranceDetail: InsuranceDetail | null
  sortOrder: number
  createdAt: string
}

function normalizeRow(row: typeof monthlyFixedExpenses.$inferSelect): NormalizedMonthlyExpense {
  const expenseType: MonthlyExpenseType = isValidMonthlyExpenseType(row.expenseType)
    ? row.expenseType
    : 'none'

  let telecomDetail: TelecomDetail | null = null
  let healthInsuranceDetail: HealthInsuranceDetail | null = null
  let nationalPensionDetail: NationalPensionDetail | null = null
  let insuranceDetail: InsuranceDetail | null = null
  if (expenseType === 'healthInsurance') {
    healthInsuranceDetail = parseHealthInsuranceDetail(row.telecomDetail)
  } else if (expenseType === 'nationalPension') {
    nationalPensionDetail = parseNationalPensionDetail(row.telecomDetail)
  } else if (expenseType === 'insurance') {
    insuranceDetail = parseInsuranceDetail(row.telecomDetail)
  } else if (hasSectionExpenseDetailType(expenseType)) {
    telecomDetail = parseTelecomDetail(row.telecomDetail)
  }

  return {
    id: row.id,
    title: row.title,
    dayOfMonth: normalizeMonthlyExpenseDayFromDb(row.dayOfMonth),
    amount: row.amount,
    payType: row.payType === 'cash' ? 'cash' : 'card',
    expenseType,
    telecomDetail,
    healthInsuranceDetail,
    nationalPensionDetail,
    insuranceDetail,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  }
}

export async function loadMonthlyExpenses(): Promise<NormalizedMonthlyExpense[]> {
  await ensureMonthlyExpenseSchema()
  const rows = await db
    .select()
    .from(monthlyFixedExpenses)
    .orderBy(asc(monthlyFixedExpenses.sortOrder), asc(monthlyFixedExpenses.id))

  return rows.map(normalizeRow)
}

export async function syncMonthlyExpenseOrder(ids: number[]) {
  await ensureMonthlyExpenseSchema()
  const existing = await db.select().from(monthlyFixedExpenses)
  const existingIds = new Set(existing.map((row) => row.id))

  if (ids.length !== existing.length || !ids.every((id) => existingIds.has(id))) {
    throw new Error('invalid order')
  }

  for (let i = 0; i < ids.length; i++) {
    await db
      .update(monthlyFixedExpenses)
      .set({ sortOrder: i })
      .where(eq(monthlyFixedExpenses.id, ids[i]))
  }

  return loadMonthlyExpenses()
}

export async function getMonthlyExpense(id: number): Promise<NormalizedMonthlyExpense | null> {
  const rows = await db.select().from(monthlyFixedExpenses).where(eq(monthlyFixedExpenses.id, id)).limit(1)
  return rows[0] ? normalizeRow(rows[0]) : null
}

export async function createMonthlyExpense(payload: MonthlyExpensePayload) {
  await ensureMonthlyExpenseSchema()
  const existing = await db.select().from(monthlyFixedExpenses)
  const now = new Date().toISOString()

  const inserted = await db
    .insert(monthlyFixedExpenses)
    .values({
      title: payload.title,
      dayOfMonth: monthlyExpenseDayForDb(payload.dayOfMonth),
      amount: payload.amount,
      payType: payload.payType,
      expenseType: payload.expenseType,
      telecomDetail: expenseDetailJsonForDb(payload),
      sortOrder: existing.length,
      createdAt: now,
    })
    .returning()

  if (!inserted[0]) throw new Error('insert failed')
  return normalizeRow(inserted[0])
}

export async function updateMonthlyExpense(id: number, payload: MonthlyExpensePayload) {
  const rows = await db
    .update(monthlyFixedExpenses)
    .set({
      title: payload.title,
      dayOfMonth: monthlyExpenseDayForDb(payload.dayOfMonth),
      amount: payload.amount,
      payType: payload.payType,
      expenseType: payload.expenseType,
      telecomDetail: expenseDetailJsonForDb(payload),
    })
    .where(eq(monthlyFixedExpenses.id, id))
    .returning()

  if (!rows[0]) return null
  return normalizeRow(rows[0])
}

export async function deleteMonthlyExpense(id: number) {
  await db.delete(monthlyFixedExpenses).where(eq(monthlyFixedExpenses.id, id))
}
