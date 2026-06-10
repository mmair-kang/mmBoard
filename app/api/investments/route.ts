// 수정: Auto — 2026-06-08

import { loadInvestmentData } from '@/lib/investmentQuery'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await loadInvestmentData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[investments GET]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
