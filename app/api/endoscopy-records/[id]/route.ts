// 수정: Auto — 2026-07-27 02:39 (금액 여러 건)
// 수정: Auto — 2026-07-27 02:17 (검사항목·결과·권고사항 분리)
// 수정: Auto — 2026-07-27 02:09

import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import {
  parseEndoscopyRecordPayload,
  serializeEndoscopyCostItems,
} from '@/lib/endoscopyPayload'
import { ensureEndoscopySchema } from '@/lib/endoscopySchema'
import { endoscopyRecords } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseEndoscopyRecordPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureEndoscopySchema()
  const rows = await db
    .update(endoscopyRecords)
    .set({
      scopeType: payload.scopeType,
      examDate: payload.examDate,
      examItem: payload.examItem,
      result: payload.result,
      recommendation: payload.recommendation,
      costItems: serializeEndoscopyCostItems(payload.costItems),
      content: '',
    })
    .where(eq(endoscopyRecords.id, itemId))
    .returning()

  if (rows.length === 0) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  await ensureEndoscopySchema()
  await db.delete(endoscopyRecords).where(eq(endoscopyRecords.id, itemId))
  return NextResponse.json({ ok: true })
}
