// 수정: Auto — 2026-06-08
import { NextResponse } from 'next/server'

import { parseDividendHoldingsPayload } from '@/lib/dividendPayload'
import { loadDividendData, syncDividendHoldings } from '@/lib/dividendQuery'

export async function GET() {
  try {
    const data = await loadDividendData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[dividends GET]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const holdings = parseDividendHoldingsPayload(body)
    if (!holdings) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await syncDividendHoldings(holdings)
    return NextResponse.json(await loadDividendData())
  } catch (error) {
    console.error('[dividends PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
