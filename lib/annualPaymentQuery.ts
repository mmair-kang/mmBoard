// 수정: Auto — 2026-07-19 14:40 (연납 타입·자동차보험)
// 수정: Auto — 2026-06-08
import { asc, eq } from 'drizzle-orm'

import type { AnnualPaymentPayload } from '@/lib/annualPaymentPayload'
import { annualDetailJsonForDb, annualPaymentDayForDb } from '@/lib/annualPaymentPayload'
import { annualDayFromDb, annualDueSortKey, currentYear } from '@/lib/annualPaymentLabel'
import { ensureAnnualPaymentSchema } from '@/lib/annualPaymentSchema'
import {
  isValidAnnualPaymentType,
  type AnnualPaymentType,
} from '@/lib/annualPaymentTypes'
import {
  parseCarInsuranceAnnualDetail,
  type CarInsuranceAnnualDetail,
} from '@/lib/carInsuranceAnnualDetail'
import {
  parseCursorProAnnualDetail,
  type CursorProAnnualDetail,
} from '@/lib/cursorProAnnualDetail'
import { db } from '@/lib/db'
import { annualPayments } from '@/lib/schema'

export type AnnualPaymentRow = {
  id: number
  title: string
  month: number
  dayOfMonth: number | null
  amount: number
  paymentType: string
  detailJson: string | null
  switchOn: number
  progressYear: string
  sortOrder: number
  createdAt: string
}

export type NormalizedAnnualPayment = {
  id: number
  title: string
  month: number
  dayOfMonth: number | null
  amount: number
  paymentType: AnnualPaymentType
  carInsuranceDetail: CarInsuranceAnnualDetail | null
  cursorProDetail: CursorProAnnualDetail | null
  switchOn: boolean
  progressYear: string
  sortOrder: number
  createdAt: string
}

function normalizeRow(row: AnnualPaymentRow, year = currentYear()): NormalizedAnnualPayment {
  const isCurrentYear = row.progressYear === year
  const paymentType: AnnualPaymentType = isValidAnnualPaymentType(row.paymentType)
    ? row.paymentType
    : 'none'

  let carInsuranceDetail: CarInsuranceAnnualDetail | null = null
  let cursorProDetail: CursorProAnnualDetail | null = null
  if (paymentType === 'carInsurance') {
    carInsuranceDetail = parseCarInsuranceAnnualDetail(row.detailJson)
  } else if (paymentType === 'cursorPro') {
    cursorProDetail = parseCursorProAnnualDetail(row.detailJson)
  }

  return {
    id: row.id,
    title: row.title,
    month: row.month,
    dayOfMonth: annualDayFromDb(row.dayOfMonth),
    amount: row.amount,
    paymentType,
    carInsuranceDetail,
    cursorProDetail,
    switchOn: isCurrentYear ? row.switchOn === 1 : false,
    progressYear: row.progressYear,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  }
}

export function sortAnnualPayments<T extends { month: number; dayOfMonth: number | null; sortOrder: number }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const keyA = annualDueSortKey(a.month, a.dayOfMonth) * 1000 + a.sortOrder
    const keyB = annualDueSortKey(b.month, b.dayOfMonth) * 1000 + b.sortOrder
    return keyA - keyB
  })
}

export async function loadAnnualPayments(): Promise<NormalizedAnnualPayment[]> {
  await ensureAnnualPaymentSchema()
  const rows = await db
    .select()
    .from(annualPayments)
    .orderBy(asc(annualPayments.sortOrder), asc(annualPayments.id))

  return sortAnnualPayments(rows.map((row) => normalizeRow(row as AnnualPaymentRow)))
}

export async function syncAnnualPayments(payments: AnnualPaymentPayload[]) {
  await ensureAnnualPaymentSchema()
  const existing = await db.select().from(annualPayments)
  const existingIds = new Set(existing.map((row) => row.id))
  const keepIds = new Set<number>()
  const year = currentYear()
  const now = new Date().toISOString()

  for (let i = 0; i < payments.length; i++) {
    const payment = payments[i]
    const dbDay = annualPaymentDayForDb(payment.dayOfMonth)
    const detailJson = annualDetailJsonForDb(payment)

    if (payment.id && existingIds.has(payment.id)) {
      keepIds.add(payment.id)
      await db
        .update(annualPayments)
        .set({
          title: payment.title,
          month: payment.month,
          dayOfMonth: dbDay,
          amount: payment.amount,
          paymentType: payment.paymentType,
          detailJson,
          sortOrder: i,
        })
        .where(eq(annualPayments.id, payment.id))
      continue
    }

    await db.insert(annualPayments).values({
      title: payment.title,
      month: payment.month,
      dayOfMonth: dbDay,
      amount: payment.amount,
      paymentType: payment.paymentType,
      detailJson,
      switchOn: 0,
      progressYear: year,
      sortOrder: i,
      createdAt: now,
    })
  }

  for (const row of existing) {
    if (!keepIds.has(row.id)) {
      await db.delete(annualPayments).where(eq(annualPayments.id, row.id))
    }
  }
}

export async function updateAnnualPayment(id: number, payload: AnnualPaymentPayload) {
  await ensureAnnualPaymentSchema()
  const rows = await db
    .update(annualPayments)
    .set({
      title: payload.title,
      month: payload.month,
      dayOfMonth: annualPaymentDayForDb(payload.dayOfMonth),
      amount: payload.amount,
      paymentType: payload.paymentType,
      detailJson: annualDetailJsonForDb(payload),
    })
    .where(eq(annualPayments.id, id))
    .returning()

  if (!rows[0]) return null
  return normalizeRow(rows[0] as AnnualPaymentRow)
}

export async function deleteAnnualPayment(id: number) {
  await ensureAnnualPaymentSchema()
  await db.delete(annualPayments).where(eq(annualPayments.id, id))
}

export async function createAnnualPayment(payload: AnnualPaymentPayload) {
  await ensureAnnualPaymentSchema()
  const existing = await db.select().from(annualPayments)
  const year = currentYear()
  const now = new Date().toISOString()

  const inserted = await db
    .insert(annualPayments)
    .values({
      title: payload.title,
      month: payload.month,
      dayOfMonth: annualPaymentDayForDb(payload.dayOfMonth),
      amount: payload.amount,
      paymentType: payload.paymentType,
      detailJson: annualDetailJsonForDb(payload),
      switchOn: 0,
      progressYear: year,
      sortOrder: existing.length,
      createdAt: now,
    })
    .returning()

  if (!inserted[0]) throw new Error('insert failed')
  return normalizeRow(inserted[0] as AnnualPaymentRow)
}
