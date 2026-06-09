// 수정: Auto — 2026-06-08
import { asc } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { currentYearMonth, normalizeMonthlyTaskForCurrentMonth } from '@/lib/monthlyTaskMonth'
import { parseMonthlyTaskPayload } from '@/lib/monthlyTaskPayload'
import { attachCardExtras, syncCardExtras } from '@/lib/monthlyTaskQuery'
import { ensureMonthlyTaskSchema } from '@/lib/monthlyTaskSchema'
import { monthlyTaskItems } from '@/lib/schema'

export async function GET() {
  await ensureMonthlyTaskSchema()
  const rows = await db.select().from(monthlyTaskItems).orderBy(asc(monthlyTaskItems.createdAt))
  const normalized = rows.map((row) => normalizeMonthlyTaskForCurrentMonth(row))
  const withExtras = await attachCardExtras(normalized)
  return NextResponse.json(withExtras)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseMonthlyTaskPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureMonthlyTaskSchema()
    const rows = await db
      .insert(monthlyTaskItems)
      .values({
        title: payload.title,
        dayOfMonth: payload.dayOfMonth,
        optionType: payload.optionType,
        targetAmount: payload.targetAmount,
        currentAmount: 0,
        switchOn: 0,
        progressMonth: currentYearMonth(),
        createdAt: new Date().toISOString(),
      })
      .returning()

    if (!rows[0]) {
      return NextResponse.json({ message: 'insert failed' }, { status: 500 })
    }

    if (payload.optionType === 'card_target' && payload.cardExtras.length > 0) {
      await syncCardExtras(rows[0].id, payload.cardExtras)
    }

    const created = await attachCardExtras([normalizeMonthlyTaskForCurrentMonth(rows[0])])
    return NextResponse.json(created[0])
  } catch (error) {
    console.error('[monthly-tasks POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
