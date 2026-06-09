// 수정: Auto — 2026-06-08
import { NextResponse } from 'next/server'

import { parseMonthlyExpensePayload } from '@/lib/monthlyExpensePayload'
import { deleteMonthlyExpense, updateMonthlyExpense } from '@/lib/monthlyExpenseQuery'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const itemId = Number(id)
    if (!Number.isFinite(itemId)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const payload = parseMonthlyExpensePayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const updated = await updateMonthlyExpense(itemId, payload)
    if (!updated) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[monthly-expenses PATCH]', error)
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

    await deleteMonthlyExpense(itemId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[monthly-expenses DELETE]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
