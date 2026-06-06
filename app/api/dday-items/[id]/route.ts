// 수정: Auto — 2026-06-05
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { parseDdayItemPayload } from '@/lib/ddayPayload'
import { ensureDdaySchema } from '@/lib/ddaySchema'
import { ddayItems } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseDdayItemPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureDdaySchema()
  const rows = await db
    .update(ddayItems)
    .set({
      name: payload.name,
      lastVisitDate: payload.lastVisitDate,
      intervalValue: payload.intervalValue,
      intervalUnit: payload.intervalUnit,
    })
    .where(eq(ddayItems.id, itemId))
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

  await ensureDdaySchema()
  await db.delete(ddayItems).where(eq(ddayItems.id, itemId))
  return NextResponse.json({ ok: true })
}
