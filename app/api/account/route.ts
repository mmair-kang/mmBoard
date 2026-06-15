// 수정: Auto — 2026-06-15
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { parseAccountBalancePayload, parseOutflowsPayload } from '@/lib/accountPayload'
import { getAccountWithOutflows, syncOutflows } from '@/lib/accountQuery'
import { db } from '@/lib/db'
import { mainAccounts } from '@/lib/schema'

export async function GET() {
  const account = await getAccountWithOutflows()
  return NextResponse.json(account)
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const account = await getAccountWithOutflows()

    const now = new Date().toISOString()
    const updates: {
      name?: string
      balance?: number
      updatedAt?: string
      balanceUpdatedAt?: string
    } = {}

    if (typeof body.name === 'string' && body.name.trim()) {
      updates.name = body.name.trim()
    }

    if ('balance' in body) {
      const balance = parseAccountBalancePayload(body)
      if (balance === null) {
        return NextResponse.json({ message: 'invalid request' }, { status: 400 })
      }
      updates.balance = balance
      updates.balanceUpdatedAt = now
      updates.updatedAt = now
    } else if (updates.name !== undefined) {
      updates.updatedAt = now
    }

    const hasOutflows = 'outflows' in body
    let outflows = null as ReturnType<typeof parseOutflowsPayload>
    if (hasOutflows) {
      outflows = parseOutflowsPayload(body)
      if (outflows === null) {
        return NextResponse.json({ message: 'invalid request' }, { status: 400 })
      }
    }

    if (updates.name === undefined && updates.balance === undefined && !hasOutflows) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    if (updates.name !== undefined || updates.balance !== undefined) {
      await db
        .update(mainAccounts)
        .set({
          ...(updates.name !== undefined ? { name: updates.name } : {}),
          ...(updates.balance !== undefined ? { balance: updates.balance } : {}),
          ...(updates.updatedAt !== undefined ? { updatedAt: updates.updatedAt } : {}),
          ...(updates.balanceUpdatedAt !== undefined
            ? { balanceUpdatedAt: updates.balanceUpdatedAt }
            : {}),
        })
        .where(eq(mainAccounts.id, account.id))
    }

    if (outflows) {
      await syncOutflows(account.id, outflows)
    }

    return NextResponse.json(await getAccountWithOutflows())
  } catch (error) {
    console.error('[account PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
