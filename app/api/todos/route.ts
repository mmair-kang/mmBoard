// 수정: Auto — 2026-06-11

import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { parseTodoItemPayload } from '@/lib/todoPayload'
import { ensureTodoSchema } from '@/lib/todoSchema'
import { sortTodoItems } from '@/lib/todoFormat'
import { todoItems } from '@/lib/schema'

export async function GET() {
  await ensureTodoSchema()
  const rows = await db.select().from(todoItems).orderBy(desc(todoItems.createdAt))
  return NextResponse.json(sortTodoItems(rows))
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseTodoItemPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureTodoSchema()
    const rows = await db
      .insert(todoItems)
      .values({
        content: payload.content,
        dueDate: payload.dueDate,
        dueTime: payload.dueTime,
        createdAt: new Date().toISOString(),
      })
      .returning()

    if (!rows[0]) {
      return NextResponse.json({ message: 'insert failed' }, { status: 500 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('[todos POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
