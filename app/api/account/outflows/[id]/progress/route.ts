// 수정: Auto — 2026-06-08
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { parseOutflowProgressPayload } from '@/lib/accountPayload'
import { getAccountWithOutflows } from '@/lib/accountQuery'
import { ensureAccountSchema } from '@/lib/accountSchema'
import { db } from '@/lib/db'
import { currentYearMonth } from '@/lib/monthlyTaskMonth'
import { accountOutflows } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const outflowId = Number(id)
  if (!Number.isFinite(outflowId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseOutflowProgressPayload(body)
  if (!payload || payload.switchOn === undefined) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureAccountSchema()
  const existing = await db
    .select()
    .from(accountOutflows)
    .where(eq(accountOutflows.id, outflowId))
    .limit(1)

  if (!existing[0]) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  const yearMonth = currentYearMonth()
  await db
    .update(accountOutflows)
    .set({
      switchOn: payload.switchOn ? 1 : 0,
      progressMonth: yearMonth,
    })
    .where(eq(accountOutflows.id, outflowId))

  return NextResponse.json(await getAccountWithOutflows())
}
