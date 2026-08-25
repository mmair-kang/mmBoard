// 수정: Auto — 2026-08-25 00:20 (칸 내용 맞바꾸기)

import { NextResponse } from 'next/server'

import { parseOrganizeSwapPayload } from '@/lib/organizePayload'
import { swapOrganizeCells } from '@/lib/organizeQuery'
import { ensureOrganizeSchema } from '@/lib/organizeSchema'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = await parseOrganizeSwapPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureOrganizeSchema()
    const rows = await swapOrganizeCells(payload.a, payload.b)
    if (!rows[0] || !rows[1]) {
      return NextResponse.json({ message: 'swap failed' }, { status: 500 })
    }

    return NextResponse.json(rows)
  } catch (error) {
    console.error('[organize-cells swap POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
