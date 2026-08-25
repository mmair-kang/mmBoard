// 수정: Auto — 2026-08-24 23:25 (수납 칸 upsert·스왑)

import { and, eq } from 'drizzle-orm'

import type { OrganizeCellPayload, OrganizeCellRefPayload } from '@/lib/organizePayload'
import { organizeCells } from '@/lib/schema'
import { db } from '@/lib/db'

export async function listOrganizeCells() {
  return db.select().from(organizeCells)
}

async function findOrganizeCell(ref: OrganizeCellRefPayload) {
  const rows = await db
    .select()
    .from(organizeCells)
    .where(
      and(
        eq(organizeCells.room, ref.room),
        eq(organizeCells.cabinetKey, ref.cabinetKey),
        eq(organizeCells.rowIndex, ref.rowIndex),
        eq(organizeCells.colIndex, ref.colIndex),
      ),
    )
    .limit(1)
  return rows[0] ?? null
}

export async function upsertOrganizeCell(payload: OrganizeCellPayload) {
  const now = new Date().toISOString()
  const existing = await findOrganizeCell(payload)

  if (existing) {
    const rows = await db
      .update(organizeCells)
      .set({
        content: payload.content,
        updatedAt: now,
      })
      .where(eq(organizeCells.id, existing.id))
      .returning()
    return rows[0] ?? null
  }

  const rows = await db
    .insert(organizeCells)
    .values({
      room: payload.room,
      cabinetKey: payload.cabinetKey,
      rowIndex: payload.rowIndex,
      colIndex: payload.colIndex,
      content: payload.content,
      updatedAt: now,
    })
    .returning()
  return rows[0] ?? null
}

export async function swapOrganizeCells(a: OrganizeCellRefPayload, b: OrganizeCellRefPayload) {
  const aRow = await findOrganizeCell(a)
  const bRow = await findOrganizeCell(b)
  const nextA = await upsertOrganizeCell({ ...a, content: bRow?.content ?? '' })
  const nextB = await upsertOrganizeCell({ ...b, content: aRow?.content ?? '' })
  return [nextA, nextB] as const
}
