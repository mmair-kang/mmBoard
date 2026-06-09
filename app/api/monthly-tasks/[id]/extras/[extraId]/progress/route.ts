// 수정: Auto — 2026-06-08
import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { parseCardExtraProgressPayload } from '@/lib/monthlyTaskCardExtraPayload'
import { currentYearMonth } from '@/lib/monthlyTaskMonth'
import { getMonthlyTaskWithExtras } from '@/lib/monthlyTaskQuery'
import { ensureMonthlyTaskSchema } from '@/lib/monthlyTaskSchema'
import { monthlyTaskCardExtras } from '@/lib/schema'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; extraId: string }> },
) {
  const { id, extraId: extraIdParam } = await params
  const taskId = Number(id)
  const extraId = Number(extraIdParam)
  if (!Number.isFinite(taskId) || !Number.isFinite(extraId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseCardExtraProgressPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureMonthlyTaskSchema()
  const existing = await db
    .select()
    .from(monthlyTaskCardExtras)
    .where(and(eq(monthlyTaskCardExtras.id, extraId), eq(monthlyTaskCardExtras.taskId, taskId)))
    .limit(1)

  if (!existing[0]) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  const yearMonth = currentYearMonth()
  const row = existing[0]
  const isCurrentMonth = row.progressMonth === yearMonth

  const updates: {
    progressMonth: string
    checked?: number
    switchOn?: number
  } = { progressMonth: yearMonth }

  if (payload.checked !== undefined) {
    updates.checked = payload.checked ? 1 : 0
  } else if (!isCurrentMonth) {
    updates.checked = 0
  }

  if (payload.switchOn !== undefined) {
    updates.switchOn = payload.switchOn ? 1 : 0
  } else if (!isCurrentMonth) {
    updates.switchOn = 0
  }

  await db.update(monthlyTaskCardExtras).set(updates).where(eq(monthlyTaskCardExtras.id, extraId))

  const updated = await getMonthlyTaskWithExtras(taskId)
  if (!updated) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}
