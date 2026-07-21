// 수정: Auto — 2026-07-21 21:57 (관리계좌)
import { asc, eq } from 'drizzle-orm'

import type { ManagedAccountPayload, OutflowPayload } from '@/lib/accountPayload'
import { outflowDayForDb } from '@/lib/accountPayload'
import { ensureAccountSchema } from '@/lib/accountSchema'
import { db } from '@/lib/db'
import { currentYearMonth } from '@/lib/monthlyTaskMonth'
import { normalizeMonthlyDayFromDb } from '@/lib/monthlyDayLabel'
import { accountOutflows, mainAccounts, managedAccounts } from '@/lib/schema'

export type ManagedAccountType = 'general' | 'subscription'

export type AccountRow = {
  id: number
  name: string
  balance: number
  updatedAt: string
  balanceUpdatedAt: string | null
  seongnamLoveBalance: number
  seongnamLoveBalanceUpdatedAt: string | null
  ibkSubscriptionBalance: number
  ibkSubscriptionBalanceUpdatedAt: string | null
  managedGroupName: string
}

export type ManagedAccountRow = {
  id: number
  name: string
  accountType: ManagedAccountType
  balance: number
  balanceUpdatedAt: string | null
  sortOrder: number
  createdAt: string
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
  managedAccounts: ManagedAccountRow[]
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

function normalizeManagedType(value: string | null | undefined): ManagedAccountType {
  return value === 'subscription' ? 'subscription' : 'general'
}

async function seedManagedAccountsIfEmpty(legacy: AccountRow) {
  const existing = await db.select().from(managedAccounts).limit(1)
  if (existing[0]) return

  const now = new Date().toISOString()
  await db.insert(managedAccounts).values([
    {
      name: '성남사랑',
      accountType: 'general',
      balance: legacy.seongnamLoveBalance ?? 0,
      balanceUpdatedAt: legacy.seongnamLoveBalanceUpdatedAt ?? now,
      sortOrder: 0,
      createdAt: now,
    },
    {
      name: 'IBK청약통장',
      accountType: 'subscription',
      balance: legacy.ibkSubscriptionBalance ?? 0,
      balanceUpdatedAt: legacy.ibkSubscriptionBalanceUpdatedAt ?? now,
      sortOrder: 1,
      createdAt: now,
    },
  ])
}

export async function ensureMainAccount(): Promise<AccountRow> {
  await ensureAccountSchema()
  const rows = await db.select().from(mainAccounts).limit(1)
  if (rows[0]) {
    const account = {
      ...rows[0],
      managedGroupName: rows[0].managedGroupName || '관리계좌',
    }
    await seedManagedAccountsIfEmpty(account)
    return account
  }

  const now = new Date().toISOString()
  const inserted = await db
    .insert(mainAccounts)
    .values({
      name: '미래에셋',
      balance: 0,
      updatedAt: now,
      balanceUpdatedAt: now,
      seongnamLoveBalance: 0,
      seongnamLoveBalanceUpdatedAt: now,
      ibkSubscriptionBalance: 0,
      ibkSubscriptionBalanceUpdatedAt: now,
      managedGroupName: '관리계좌',
    })
    .returning()

  if (!inserted[0]) throw new Error('account insert failed')
  await seedManagedAccountsIfEmpty(inserted[0])
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

export async function loadManagedAccounts(): Promise<ManagedAccountRow[]> {
  const rows = await db
    .select()
    .from(managedAccounts)
    .orderBy(asc(managedAccounts.sortOrder), asc(managedAccounts.id))

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    accountType: normalizeManagedType(row.accountType),
    balance: row.balance ?? 0,
    balanceUpdatedAt: row.balanceUpdatedAt ?? null,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  }))
}

export async function getAccountWithOutflows(): Promise<AccountWithOutflows> {
  const account = await ensureMainAccount()
  const [outflows, managed] = await Promise.all([loadOutflows(account.id), loadManagedAccounts()])
  return {
    ...account,
    seongnamLoveBalance: account.seongnamLoveBalance ?? 0,
    seongnamLoveBalanceUpdatedAt: account.seongnamLoveBalanceUpdatedAt ?? null,
    ibkSubscriptionBalance: account.ibkSubscriptionBalance ?? 0,
    ibkSubscriptionBalanceUpdatedAt: account.ibkSubscriptionBalanceUpdatedAt ?? null,
    managedGroupName: account.managedGroupName || '관리계좌',
    outflows,
    managedAccounts: managed,
  }
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

export async function syncManagedAccounts(accounts: ManagedAccountPayload[]) {
  const existing = await db.select().from(managedAccounts)
  const existingById = new Map(existing.map((row) => [row.id, row]))
  const keepIds = new Set<number>()
  const now = new Date().toISOString()

  for (let i = 0; i < accounts.length; i++) {
    const item = accounts[i]
    const accountType = item.accountType === 'subscription' ? 'subscription' : 'general'

    if (item.id && existingById.has(item.id)) {
      keepIds.add(item.id)
      const prev = existingById.get(item.id)!
      await db
        .update(managedAccounts)
        .set({
          name: item.name,
          accountType,
          sortOrder: i,
          // 잔액은 목록 동기화에서 덮어쓰지 않음 (잔액은 별도 PATCH)
          balance: prev.balance,
          balanceUpdatedAt: prev.balanceUpdatedAt,
        })
        .where(eq(managedAccounts.id, item.id))
      continue
    }

    await db.insert(managedAccounts).values({
      name: item.name,
      accountType,
      balance: 0,
      balanceUpdatedAt: now,
      sortOrder: i,
      createdAt: now,
    })
  }

  for (const row of existing) {
    if (!keepIds.has(row.id)) {
      await db.delete(managedAccounts).where(eq(managedAccounts.id, row.id))
    }
  }
}

export async function updateManagedAccountBalance(id: number, balance: number) {
  const now = new Date().toISOString()
  const updated = await db
    .update(managedAccounts)
    .set({ balance, balanceUpdatedAt: now })
    .where(eq(managedAccounts.id, id))
    .returning()
  return updated[0] ?? null
}
