// 수정: Auto — 2026-06-11

import { parseInvestmentAccountSyncPayload } from '@/lib/investmentPayload'
import { loadInvestmentData, syncInvestmentAccount } from '@/lib/investmentQuery'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseInvestmentAccountSyncPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await syncInvestmentAccount(payload)
    return NextResponse.json(await loadInvestmentData())
  } catch (error) {
    console.error('[investments account PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
