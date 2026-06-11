// 수정: Auto — 2026-06-11

import { normalizeManageTabOrder } from '@/lib/manageTabOrder'
import { loadManageTabOrderData, saveManageTabOrderData } from '@/lib/manageTabOrderQuery'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await loadManageTabOrderData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[manage-tab-order GET]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    if (!Array.isArray(body.order)) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const order = normalizeManageTabOrder(body.order)

    const data = await saveManageTabOrderData(order)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[manage-tab-order PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
