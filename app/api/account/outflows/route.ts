// 수정: Auto — 2026-06-08
import { NextResponse } from 'next/server'

import { outflowDayForDb, parseOutflowPayload } from '@/lib/accountPayload'
import { ensureMainAccount, getAccountWithOutflows } from '@/lib/accountQuery'
import { currentYearMonth } from '@/lib/monthlyTaskMonth'
import { db } from '@/lib/db'
import { accountOutflows } from '@/lib/schema'
import { asc, eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseOutflowPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const account = await ensureMainAccount()
    const existing = await db
      .select()
      .from(accountOutflows)
      .where(eq(accountOutflows.accountId, account.id))
      .orderBy(asc(accountOutflows.sortOrder))

    const sortOrder = existing.length

    await db.insert(accountOutflows).values({
      accountId: account.id,
      dayOfMonth: outflowDayForDb(payload.dayOfMonth),
      title: payload.title,
      amount: payload.amount,
      switchOn: 0,
      progressMonth: currentYearMonth(),
      sortOrder,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json(await getAccountWithOutflows())
  } catch (error) {
    console.error('[account outflows POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
