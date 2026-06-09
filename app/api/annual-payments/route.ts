// 수정: Auto — 2026-06-08
import { NextResponse } from 'next/server'

import {
  annualPaymentDayForDb,
  parseAnnualPaymentPayload,
  parseAnnualPaymentsPayload,
} from '@/lib/annualPaymentPayload'
import { currentYear } from '@/lib/annualPaymentLabel'
import { loadAnnualPayments, syncAnnualPayments } from '@/lib/annualPaymentQuery'
import { ensureAnnualPaymentSchema } from '@/lib/annualPaymentSchema'
import { db } from '@/lib/db'
import { annualPayments } from '@/lib/schema'
import { asc, eq } from 'drizzle-orm'

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

    await ensureAnnualPaymentSchema()
    const existing = await db.select().from(annualPayments).orderBy(asc(annualPayments.sortOrder))
    const sortOrder = existing.length

    await db.insert(annualPayments).values({
      title: payload.title,
      month: payload.month,
      dayOfMonth: annualPaymentDayForDb(payload.dayOfMonth),
      amount: payload.amount,
      switchOn: 0,
      progressYear: currentYear(),
      sortOrder,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json(await loadAnnualPayments())
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
