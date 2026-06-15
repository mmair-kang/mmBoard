// 수정: Auto — 2026-06-15
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { currentYearMonth } from '@/lib/monthlyTaskMonth'
import { parseMonthlyTaskProgressPayload } from '@/lib/monthlyTaskPayload'
import { getMonthlyTaskWithExtras } from '@/lib/monthlyTaskQuery'
import { ensureMonthlyTaskSchema } from '@/lib/monthlyTaskSchema'
import { monthlyTaskItems } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseMonthlyTaskProgressPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureMonthlyTaskSchema()
  const existing = await db
    .select()
    .from(monthlyTaskItems)
    .where(eq(monthlyTaskItems.id, itemId))
    .limit(1)

  if (!existing[0]) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  const yearMonth = currentYearMonth()
  const row = existing[0]
  const isCurrentMonth = row.progressMonth === yearMonth

  const updates: {
    progressMonth: string
    currentAmount?: number
    currentAmountUpdatedAt?: string
    switchOn?: number
  } = { progressMonth: yearMonth }

  if (payload.currentAmount !== undefined) {
    updates.currentAmount = payload.currentAmount
    updates.currentAmountUpdatedAt = new Date().toISOString()
  } else if (!isCurrentMonth) {
    updates.currentAmount = 0
  }

  if (payload.switchOn !== undefined) {
    updates.switchOn = payload.switchOn ? 1 : 0
  } else if (!isCurrentMonth) {
    updates.switchOn = 0
  }

  const rows = await db
    .update(monthlyTaskItems)
    .set(updates)
    .where(eq(monthlyTaskItems.id, itemId))
    .returning()

  if (!rows[0]) {
    return NextResponse.json({ message: 'update failed' }, { status: 500 })
  }

  const updated = await getMonthlyTaskWithExtras(itemId)
  return NextResponse.json(updated)
}
