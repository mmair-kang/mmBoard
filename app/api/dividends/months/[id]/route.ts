// 수정: Auto — 2026-06-08
import { NextResponse } from 'next/server'

import { parseDividendEntryPayload } from '@/lib/dividendPayload'
import { deleteDividendMonth, loadDividendData, updateDividendMonth } from '@/lib/dividendQuery'

type RouteContext = { params: Promise<{ id: string }> }

function parseEntriesBody(body: Record<string, unknown>) {
  if (!Array.isArray(body.entries) || body.entries.length === 0) return null
  const entries = []
  for (const item of body.entries) {
    const parsed = parseDividendEntryPayload(item)
    if (!parsed) return null
    entries.push(parsed)
  }
  return entries
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const monthId = Number(id)
    if (!Number.isFinite(monthId)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const entries = parseEntriesBody(body)
    if (!entries) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await updateDividendMonth(monthId, entries)
    return NextResponse.json(await loadDividendData())
  } catch (error) {
    console.error('[dividends/months PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const monthId = Number(id)
    if (!Number.isFinite(monthId)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    await deleteDividendMonth(monthId)
    return NextResponse.json(await loadDividendData())
  } catch (error) {
    console.error('[dividends/months DELETE]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
