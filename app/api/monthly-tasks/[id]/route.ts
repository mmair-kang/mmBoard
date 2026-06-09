// 수정: Auto — 2026-06-08
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { parseMonthlyTaskPayload } from '@/lib/monthlyTaskPayload'
import {
  attachCardExtras,
  deleteCardExtrasForTask,
  getMonthlyTaskWithExtras,
  syncCardExtras,
} from '@/lib/monthlyTaskQuery'
import { ensureMonthlyTaskSchema } from '@/lib/monthlyTaskSchema'
import { monthlyTaskItems } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseMonthlyTaskPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureMonthlyTaskSchema()
  const rows = await db
    .update(monthlyTaskItems)
    .set({
      title: payload.title,
      dayOfMonth: payload.dayOfMonth,
      optionType: payload.optionType,
      targetAmount: payload.targetAmount,
    })
    .where(eq(monthlyTaskItems.id, itemId))
    .returning()

  if (rows.length === 0) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  if (payload.optionType === 'card_target') {
    await syncCardExtras(itemId, payload.cardExtras)
  } else {
    await deleteCardExtrasForTask(itemId)
  }

  const updated = await getMonthlyTaskWithExtras(itemId)
  if (!updated) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  await ensureMonthlyTaskSchema()
  await deleteCardExtrasForTask(itemId)
  await db.delete(monthlyTaskItems).where(eq(monthlyTaskItems.id, itemId))
  return NextResponse.json({ ok: true })
}
