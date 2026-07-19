// 수정: Auto — 2026-07-19 14:50 (연납 개별 수정·삭제)

import { NextResponse } from 'next/server'

import { parseAnnualPaymentPayload } from '@/lib/annualPaymentPayload'
import { deleteAnnualPayment, updateAnnualPayment } from '@/lib/annualPaymentQuery'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const itemId = Number(id)
    if (!Number.isFinite(itemId)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const payload = parseAnnualPaymentPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const updated = await updateAnnualPayment(itemId, payload)
    if (!updated) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[annual-payments id PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const itemId = Number(id)
    if (!Number.isFinite(itemId)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    await deleteAnnualPayment(itemId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[annual-payments id DELETE]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
