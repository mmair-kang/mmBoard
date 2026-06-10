// 수정: Auto — 2026-06-08

import { parseInvestmentHoldingPayload } from '@/lib/investmentPayload'
import { deleteInvestmentHolding, loadInvestmentData, updateInvestmentHolding } from '@/lib/investmentQuery'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const holdingId = Number(id)
    if (!Number.isFinite(holdingId)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const payload = parseInvestmentHoldingPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const updated = await updateInvestmentHolding(holdingId, payload)
    if (!updated) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }

    return NextResponse.json(await loadInvestmentData())
  } catch (error) {
    console.error('[investments holdings PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const holdingId = Number(id)
    if (!Number.isFinite(holdingId)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    await deleteInvestmentHolding(holdingId)
    return NextResponse.json(await loadInvestmentData())
  } catch (error) {
    console.error('[investments holdings DELETE]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
