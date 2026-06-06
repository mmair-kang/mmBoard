// 수정: Auto — 2026-06-05
import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { parseDdayItemPayload } from '@/lib/ddayPayload'
import { ensureDdaySchema } from '@/lib/ddaySchema'
import { ddayItems } from '@/lib/schema'

export async function GET() {
  await ensureDdaySchema()
  const rows = await db.select().from(ddayItems).orderBy(desc(ddayItems.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseDdayItemPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureDdaySchema()
    const rows = await db
      .insert(ddayItems)
      .values({
        name: payload.name,
        lastVisitDate: payload.lastVisitDate,
        intervalValue: payload.intervalValue,
        intervalUnit: payload.intervalUnit,
        createdAt: new Date().toISOString(),
      })
      .returning()

    if (!rows[0]) {
      return NextResponse.json({ message: 'insert failed' }, { status: 500 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('[dday-items POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
