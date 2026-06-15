// 수정: Auto — 2026-06-08
import { asc, eq } from 'drizzle-orm'

import type { OutflowPayload } from '@/lib/accountPayload'
import { outflowDayForDb } from '@/lib/accountPayload'
import { ensureAccountSchema } from '@/lib/accountSchema'
import { db } from '@/lib/db'
import { currentYearMonth } from '@/lib/monthlyTaskMonth'
import { normalizeMonthlyDayFromDb } from '@/lib/monthlyDayLabel'
import { accountOutflows, mainAccounts } from '@/lib/schema'

export type AccountRow = {
  id: number
  name: string
  balance: number
  updatedAt: string
  balanceUpdatedAt: string | null
}

export type OutflowRow = {
  id: number
  accountId: number
  dayOfMonth: number
  title: string
  amount: number
  switchOn: number
  progressMonth: string
  sortOrder: number
  createdAt: string
}

export type NormalizedOutflow = {
  id: number
  accountId: number
  dayOfMonth: number | null
  title: string
  amount: number
  switchOn: boolean
  progressMonth: string
  sortOrder: number
  createdAt: string
}

export type AccountWithOutflows = AccountRow & {
  outflows: NormalizedOutflow[]
}

function normalizeOutflowRow(row: OutflowRow, yearMonth = currentYearMonth()): NormalizedOutflow {
  const isCurrentMonth = row.progressMonth === yearMonth
  return {
    id: row.id,
    accountId: row.accountId,
    dayOfMonth: normalizeMonthlyDayFromDb(row.dayOfMonth),
    title: row.title,
    amount: row.amount,
    switchOn: isCurrentMonth ? row.switchOn === 1 : false,
    progressMonth: row.progressMonth,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  }
}

export async function ensureMainAccount(): Promise<AccountRow> {
  await ensureAccountSchema()
  const rows = await db.select().from(mainAccounts).limit(1)
  if (rows[0]) return rows[0]

  const now = new Date().toISOString()
  const inserted = await db
    .insert(mainAccounts)
    .values({ name: '미래에셋', balance: 0, updatedAt: now, balanceUpdatedAt: now })
    .returning()

  if (!inserted[0]) throw new Error('account insert failed')
  return inserted[0]
}

export async function loadOutflows(accountId: number): Promise<NormalizedOutflow[]> {
  const rows = await db
    .select()
    .from(accountOutflows)
    .where(eq(accountOutflows.accountId, accountId))
    .orderBy(asc(accountOutflows.sortOrder), asc(accountOutflows.id))

  return rows.map((row) => normalizeOutflowRow(row))
}

export async function getAccountWithOutflows(): Promise<AccountWithOutflows> {
  const account = await ensureMainAccount()
  const outflows = await loadOutflows(account.id)
  return { ...account, outflows }
}

export async function syncOutflows(accountId: number, outflows: OutflowPayload[]) {
  const existing = await db
    .select()
    .from(accountOutflows)
    .where(eq(accountOutflows.accountId, accountId))

  const existingIds = new Set(existing.map((row) => row.id))
  const keepIds = new Set<number>()
  const yearMonth = currentYearMonth()
  const now = new Date().toISOString()

  for (let i = 0; i < outflows.length; i++) {
    const outflow = outflows[i]
    const dbDay = outflowDayForDb(outflow.dayOfMonth)

    if (outflow.id && existingIds.has(outflow.id)) {
      keepIds.add(outflow.id)
      await db
        .update(accountOutflows)
        .set({
          dayOfMonth: dbDay,
          title: outflow.title,
          amount: outflow.amount,
          sortOrder: i,
        })
        .where(eq(accountOutflows.id, outflow.id))
      continue
    }

    await db.insert(accountOutflows).values({
      accountId,
      dayOfMonth: dbDay,
      title: outflow.title,
      amount: outflow.amount,
      switchOn: 0,
      progressMonth: yearMonth,
      sortOrder: i,
      createdAt: now,
    })
  }

  for (const row of existing) {
    if (!keepIds.has(row.id)) {
      await db.delete(accountOutflows).where(eq(accountOutflows.id, row.id))
    }
  }
}
