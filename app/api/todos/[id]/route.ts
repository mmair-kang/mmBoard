// 수정: Auto — 2026-06-11

import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { parseTodoItemPayload } from '@/lib/todoPayload'
import { ensureTodoSchema } from '@/lib/todoSchema'
import { todoItems } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseTodoItemPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureTodoSchema()
  const rows = await db
    .update(todoItems)
    .set({
      content: payload.content,
      dueDate: payload.dueDate,
      dueTime: payload.dueTime,
    })
    .where(eq(todoItems.id, itemId))
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

  await ensureTodoSchema()
  await db.delete(todoItems).where(eq(todoItems.id, itemId))
  return NextResponse.json({ ok: true })
}
