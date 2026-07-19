// 수정: Auto — 2026-07-19 14:50 (연납 개별 생성 응답)
// 수정: Auto — 2026-06-08
import { NextResponse } from 'next/server'

import { parseAnnualPaymentPayload, parseAnnualPaymentsPayload } from '@/lib/annualPaymentPayload'
import { createAnnualPayment, loadAnnualPayments, syncAnnualPayments } from '@/lib/annualPaymentQuery'

export async function GET() {
  const payments = await loadAnnualPayments()
  return NextResponse.json(payments)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseAnnualPaymentPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const created = await createAnnualPayment(payload)
    return NextResponse.json(created)
  } catch (error) {
    console.error('[annual-payments POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payments = parseAnnualPaymentsPayload(body)
    if (payments === null) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await syncAnnualPayments(payments)
    return NextResponse.json(await loadAnnualPayments())
  } catch (error) {
    console.error('[annual-payments PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
