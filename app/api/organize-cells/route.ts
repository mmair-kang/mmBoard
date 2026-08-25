// 수정: Auto — 2026-08-25 00:20 (집 수납 칸 API)

import { NextResponse } from 'next/server'

import { parseOrganizeCellPayload } from '@/lib/organizePayload'
import { listOrganizeCells, upsertOrganizeCell } from '@/lib/organizeQuery'
import { ensureOrganizeSchema } from '@/lib/organizeSchema'

export async function GET() {
  try {
    await ensureOrganizeSchema()
    const rows = await listOrganizeCells()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('[organize-cells GET]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = await parseOrganizeCellPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureOrganizeSchema()
    const row = await upsertOrganizeCell(payload)
    if (!row) {
      return NextResponse.json({ message: 'insert failed' }, { status: 500 })
    }

    return NextResponse.json(row)
  } catch (error) {
    console.error('[organize-cells PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
