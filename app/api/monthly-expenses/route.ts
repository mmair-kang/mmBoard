// 수정: Auto — 2026-06-08
import { NextResponse } from 'next/server'

import { parseMonthlyExpenseOrder, parseMonthlyExpensePayload } from '@/lib/monthlyExpensePayload'
import { createMonthlyExpense, loadMonthlyExpenses, syncMonthlyExpenseOrder } from '@/lib/monthlyExpenseQuery'

export async function GET() {
  try {
    const items = await loadMonthlyExpenses()
    return NextResponse.json(items)
  } catch (error) {
    console.error('[monthly-expenses GET]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const order = parseMonthlyExpenseOrder(body)
    if (!order) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const items = await syncMonthlyExpenseOrder(order)
    return NextResponse.json(items)
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid order') {
      return NextResponse.json({ message: 'invalid order' }, { status: 400 })
    }
    console.error('[monthly-expenses PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseMonthlyExpensePayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const created = await createMonthlyExpense(payload)
    return NextResponse.json(created)
  } catch (error) {
    console.error('[monthly-expenses POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
