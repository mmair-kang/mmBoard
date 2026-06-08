// 수정: Auto — 2026-06-08
import { asc } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { currentYearMonth, normalizeMonthlyTaskForCurrentMonth } from '@/lib/monthlyTaskMonth'
import { parseMonthlyTaskPayload } from '@/lib/monthlyTaskPayload'
import { ensureMonthlyTaskSchema } from '@/lib/monthlyTaskSchema'
import { monthlyTaskItems } from '@/lib/schema'

export async function GET() {
  await ensureMonthlyTaskSchema()
  const rows = await db.select().from(monthlyTaskItems).orderBy(asc(monthlyTaskItems.createdAt))
  const normalized = rows.map((row) => normalizeMonthlyTaskForCurrentMonth(row))
  return NextResponse.json(normalized)
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

    return NextResponse.json(normalizeMonthlyTaskForCurrentMonth(rows[0]))
  } catch (error) {
    console.error('[monthly-tasks POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
