// 수정: Auto — 2026-06-08

import { parseInvestmentCashPayload } from '@/lib/investmentPayload'
import { loadInvestmentData, updateInvestmentCash } from '@/lib/investmentQuery'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseInvestmentCashPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await updateInvestmentCash(payload)
    return NextResponse.json(await loadInvestmentData())
  } catch (error) {
    console.error('[investments cash PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
