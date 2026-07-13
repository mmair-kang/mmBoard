// 수정: Auto — 2026-07-13 23:43

import { parseAssetSettingsPayload } from '@/lib/assetPayload'
import { loadAssetSettingsData, saveAssetSettingsData } from '@/lib/assetQuery'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await loadAssetSettingsData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[assets GET]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const partial = parseAssetSettingsPayload(body)
    if (!partial) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const data = await saveAssetSettingsData(partial)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[assets PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
