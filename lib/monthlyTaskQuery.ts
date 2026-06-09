// 수정: Auto — 2026-06-08
import { asc, eq, inArray } from 'drizzle-orm'

import { db } from '@/lib/db'
import { normalizeMonthlyDayFromDb } from '@/lib/monthlyDayLabel'
import { cardExtraDayForDb, type CardExtraPayload } from '@/lib/monthlyTaskCardExtraPayload'
import { currentYearMonth, normalizeMonthlyTaskForCurrentMonth } from '@/lib/monthlyTaskMonth'
import { ensureMonthlyTaskSchema } from '@/lib/monthlyTaskSchema'
import { monthlyTaskCardExtras, monthlyTaskItems } from '@/lib/schema'

export type CardExtraRow = {
  id: number
  taskId: number
  extraType: string
  title: string | null
  dayOfMonth: number
  amount: number
  checked: number
  switchOn: number
  progressMonth: string
  sortOrder: number
  createdAt: string
}

export type NormalizedCardExtra = {
  id: number
  taskId: number
  extraType: 'payment_switch'
  title: string | null
  dayOfMonth: number | null
  amount: number
  checked: boolean
  switchOn: boolean
  progressMonth: string
  sortOrder: number
  createdAt: string
}

export type MonthlyTaskWithExtras = ReturnType<typeof normalizeMonthlyTaskForCurrentMonth> & {
  cardExtras: NormalizedCardExtra[]
}

function normalizeCardExtraRow(row: CardExtraRow, yearMonth = currentYearMonth()): NormalizedCardExtra {
  const isCurrentMonth = row.progressMonth === yearMonth
  const isLegacyScheduled = row.extraType === 'scheduled'

  return {
    id: row.id,
    taskId: row.taskId,
    extraType: 'payment_switch',
    title: row.title ?? (isLegacyScheduled ? '결제예정' : null),
    dayOfMonth: normalizeMonthlyDayFromDb(row.dayOfMonth),
    amount: row.amount,
    checked: isCurrentMonth ? row.checked === 1 : false,
    switchOn: isCurrentMonth
      ? isLegacyScheduled
        ? row.checked === 1
        : row.switchOn === 1
      : false,
    progressMonth: row.progressMonth,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  }
}

export async function loadCardExtrasByTaskIds(taskIds: number[]): Promise<Map<number, NormalizedCardExtra[]>> {
  const map = new Map<number, NormalizedCardExtra[]>()
  if (taskIds.length === 0) return map

  const rows = await db
    .select()
    .from(monthlyTaskCardExtras)
    .where(inArray(monthlyTaskCardExtras.taskId, taskIds))
    .orderBy(asc(monthlyTaskCardExtras.sortOrder), asc(monthlyTaskCardExtras.id))

  for (const row of rows) {
    const normalized = normalizeCardExtraRow(row)
    const list = map.get(row.taskId) ?? []
    list.push(normalized)
    map.set(row.taskId, list)
  }
  return map
}

export async function attachCardExtras<T extends { id: number; optionType: string }>(
  tasks: T[],
): Promise<Array<T & { cardExtras: NormalizedCardExtra[] }>> {
  const cardTaskIds = tasks.filter((t) => t.optionType === 'card_target').map((t) => t.id)
  const extrasMap = await loadCardExtrasByTaskIds(cardTaskIds)
  return tasks.map((task) => ({
    ...task,
    cardExtras: task.optionType === 'card_target' ? (extrasMap.get(task.id) ?? []) : [],
  }))
}

export async function getMonthlyTaskWithExtras(taskId: number): Promise<MonthlyTaskWithExtras | null> {
  await ensureMonthlyTaskSchema()
  const rows = await db.select().from(monthlyTaskItems).where(eq(monthlyTaskItems.id, taskId)).limit(1)
  if (!rows[0]) return null

  const normalized = normalizeMonthlyTaskForCurrentMonth(rows[0])
  const extrasMap = await loadCardExtrasByTaskIds([taskId])
  return {
    ...normalized,
    cardExtras: extrasMap.get(taskId) ?? [],
  }
}

export async function syncCardExtras(taskId: number, extras: CardExtraPayload[]) {
  const existing = await db
    .select()
    .from(monthlyTaskCardExtras)
    .where(eq(monthlyTaskCardExtras.taskId, taskId))

  const existingIds = new Set(existing.map((row) => row.id))
  const keepIds = new Set<number>()
  const yearMonth = currentYearMonth()
  const now = new Date().toISOString()

  for (let i = 0; i < extras.length; i++) {
    const extra = extras[i]
    const dbDay = cardExtraDayForDb(extra.dayOfMonth)

    if (extra.id && existingIds.has(extra.id)) {
      keepIds.add(extra.id)
      await db
        .update(monthlyTaskCardExtras)
        .set({
          extraType: 'payment_switch',
          title: extra.title,
          dayOfMonth: dbDay,
          amount: extra.amount,
          sortOrder: i,
        })
        .where(eq(monthlyTaskCardExtras.id, extra.id))
      continue
    }

    await db.insert(monthlyTaskCardExtras).values({
      taskId,
      extraType: 'payment_switch',
      title: extra.title,
      dayOfMonth: dbDay,
      amount: extra.amount,
      checked: 0,
      switchOn: 0,
      progressMonth: yearMonth,
      sortOrder: i,
      createdAt: now,
    })
  }

  for (const row of existing) {
    if (!keepIds.has(row.id)) {
      await db.delete(monthlyTaskCardExtras).where(eq(monthlyTaskCardExtras.id, row.id))
    }
  }
}

export async function deleteCardExtrasForTask(taskId: number) {
  await db.delete(monthlyTaskCardExtras).where(eq(monthlyTaskCardExtras.taskId, taskId))
}
