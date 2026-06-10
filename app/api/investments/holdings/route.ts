// 수정: Auto — 2026-06-08

import { parseInvestmentHoldingPayload } from '@/lib/investmentPayload'
import { createInvestmentHolding, loadInvestmentData } from '@/lib/investmentQuery'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseInvestmentHoldingPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await createInvestmentHolding(payload)
    return NextResponse.json(await loadInvestmentData())
  } catch (error) {
    console.error('[investments holdings POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
