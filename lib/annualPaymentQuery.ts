// 수정: Auto — 2026-06-08
import { asc, eq } from 'drizzle-orm'

import type { AnnualPaymentPayload } from '@/lib/annualPaymentPayload'
import { annualPaymentDayForDb } from '@/lib/annualPaymentPayload'
import { annualDayFromDb, annualDueSortKey, currentYear } from '@/lib/annualPaymentLabel'
import { ensureAnnualPaymentSchema } from '@/lib/annualPaymentSchema'
import { db } from '@/lib/db'
import { annualPayments } from '@/lib/schema'

export type AnnualPaymentRow = {
  id: number
  title: string
  month: number
  dayOfMonth: number | null
  amount: number
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
  switchOn: boolean
  progressYear: string
  sortOrder: number
  createdAt: string
}

function normalizeRow(row: AnnualPaymentRow, year = currentYear()): NormalizedAnnualPayment {
  const isCurrentYear = row.progressYear === year
  return {
    id: row.id,
    title: row.title,
    month: row.month,
    dayOfMonth: annualDayFromDb(row.dayOfMonth),
    amount: row.amount,
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

  return sortAnnualPayments(rows.map((row) => normalizeRow(row)))
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

    if (payment.id && existingIds.has(payment.id)) {
      keepIds.add(payment.id)
      await db
        .update(annualPayments)
        .set({
          title: payment.title,
          month: payment.month,
          dayOfMonth: dbDay,
          amount: payment.amount,
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
