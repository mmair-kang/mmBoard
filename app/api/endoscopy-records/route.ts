// 수정: Auto — 2026-07-27 02:39 (금액 여러 건)
// 수정: Auto — 2026-07-27 02:17 (검사항목·결과·권고사항 분리)
// 수정: Auto — 2026-07-27 02:09

import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import {
  parseEndoscopyRecordPayload,
  serializeEndoscopyCostItems,
} from '@/lib/endoscopyPayload'
import { ensureEndoscopySchema } from '@/lib/endoscopySchema'
import { parseEndoscopyScope } from '@/lib/endoscopyTypes'
import { endoscopyRecords } from '@/lib/schema'

export async function GET(request: Request) {
  await ensureEndoscopySchema()
  const scope = parseEndoscopyScope(new URL(request.url).searchParams.get('scope'))

  const query = db.select().from(endoscopyRecords)
  const rows = scope
    ? await query.where(eq(endoscopyRecords.scopeType, scope)).orderBy(desc(endoscopyRecords.examDate))
    : await query.orderBy(desc(endoscopyRecords.examDate))

  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseEndoscopyRecordPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureEndoscopySchema()
    const rows = await db
      .insert(endoscopyRecords)
      .values({
        scopeType: payload.scopeType,
        examDate: payload.examDate,
        examItem: payload.examItem,
        result: payload.result,
        recommendation: payload.recommendation,
        costItems: serializeEndoscopyCostItems(payload.costItems),
        content: '',
        createdAt: new Date().toISOString(),
      })
      .returning()

    if (!rows[0]) {
      return NextResponse.json({ message: 'insert failed' }, { status: 500 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('[endoscopy-records POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
