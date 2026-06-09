// 수정: Auto — 2026-06-08
import { NextResponse } from 'next/server'

import { parseDividendMonthPayload } from '@/lib/dividendPayload'
import { createDividendMonth, loadDividendData } from '@/lib/dividendQuery'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseDividendMonthPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await createDividendMonth(payload.yearMonth, payload.entries)
    return NextResponse.json(await loadDividendData())
  } catch (error) {
    if (error instanceof Error && error.message === 'duplicate month') {
      return NextResponse.json({ message: '이미 등록된 달입니다' }, { status: 409 })
    }
    console.error('[dividends/months POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
