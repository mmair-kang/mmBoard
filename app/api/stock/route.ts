// 수정: Auto — 2026-06-08

import { fetchStockQuotes, parseStockSymbolsParam } from '@/lib/stock'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = parseStockSymbolsParam(searchParams.get('symbols'))
    const quotes = await fetchStockQuotes(symbols ?? undefined)

    return NextResponse.json({
      quotes,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[stock GET]', error)
    return NextResponse.json({ message: '시세 조회에 실패했습니다.' }, { status: 502 })
  }
}
