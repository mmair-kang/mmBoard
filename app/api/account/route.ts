// 수정: Auto — 2026-07-21 21:57 (관리계좌)
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import {
  parseAccountBalancePayload,
  parseManagedAccountBalancePayload,
  parseManagedAccountsSettingsPayload,
  parseOutflowsPayload,
} from '@/lib/accountPayload'
import {
  getAccountWithOutflows,
  syncManagedAccounts,
  syncOutflows,
  updateManagedAccountBalance,
} from '@/lib/accountQuery'
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
      managedGroupName?: string
      updatedAt?: string
      balanceUpdatedAt?: string
    } = {}

    if (typeof body.name === 'string' && body.name.trim()) {
      updates.name = body.name.trim()
    }

    const isManagedBalancePatch = 'managedAccountId' in body
    if ('balance' in body && !isManagedBalancePatch) {
      const balance = parseAccountBalancePayload(body)
      if (balance === null) {
        return NextResponse.json({ message: 'invalid request' }, { status: 400 })
      }
      updates.balance = balance
      updates.balanceUpdatedAt = now
      updates.updatedAt = now
    }

    const managedSettings =
      'managedGroupName' in body || 'managedAccounts' in body
        ? parseManagedAccountsSettingsPayload(body)
        : null
    if (('managedGroupName' in body || 'managedAccounts' in body) && managedSettings === null) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }
    if (managedSettings) {
      updates.managedGroupName = managedSettings.managedGroupName
      updates.updatedAt = now
    }

    const managedBalance = isManagedBalancePatch ? parseManagedAccountBalancePayload(body) : null
    if (isManagedBalancePatch && managedBalance === null) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const hasOutflows = 'outflows' in body
    let outflows = null as ReturnType<typeof parseOutflowsPayload>
    if (hasOutflows) {
      outflows = parseOutflowsPayload(body)
      if (outflows === null) {
        return NextResponse.json({ message: 'invalid request' }, { status: 400 })
      }
    }

    if (
      updates.name === undefined &&
      updates.balance === undefined &&
      !managedSettings &&
      !managedBalance &&
      !hasOutflows
    ) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    if (
      updates.name !== undefined ||
      updates.balance !== undefined ||
      updates.managedGroupName !== undefined
    ) {
      await db
        .update(mainAccounts)
        .set({
          ...(updates.name !== undefined ? { name: updates.name } : {}),
          ...(updates.balance !== undefined ? { balance: updates.balance } : {}),
          ...(updates.managedGroupName !== undefined
            ? { managedGroupName: updates.managedGroupName }
            : {}),
          ...(updates.updatedAt !== undefined ? { updatedAt: updates.updatedAt } : {}),
          ...(updates.balanceUpdatedAt !== undefined
            ? { balanceUpdatedAt: updates.balanceUpdatedAt }
            : {}),
        })
        .where(eq(mainAccounts.id, account.id))
    }

    if (managedSettings) {
      await syncManagedAccounts(managedSettings.managedAccounts)
    }

    if (managedBalance) {
      const updated = await updateManagedAccountBalance(managedBalance.id, managedBalance.balance)
      if (!updated) {
        return NextResponse.json({ message: 'not found' }, { status: 404 })
      }
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
