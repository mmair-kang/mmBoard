// 수정: Auto — 2026-06-11

import { loadWeatherData } from '@/lib/weatherQuery'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await loadWeatherData()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('[weather GET]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
