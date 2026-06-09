// 수정: Auto — 2026-06-08
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { currentYear } from '@/lib/annualPaymentLabel'
import { parseAnnualPaymentProgressPayload } from '@/lib/annualPaymentPayload'
import { loadAnnualPayments } from '@/lib/annualPaymentQuery'
import { ensureAnnualPaymentSchema } from '@/lib/annualPaymentSchema'
import { db } from '@/lib/db'
import { annualPayments } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const paymentId = Number(id)
  if (!Number.isFinite(paymentId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseAnnualPaymentProgressPayload(body)
  if (!payload || payload.switchOn === undefined) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureAnnualPaymentSchema()
  const existing = await db
    .select()
    .from(annualPayments)
    .where(eq(annualPayments.id, paymentId))
    .limit(1)

  if (!existing[0]) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  await db
    .update(annualPayments)
    .set({
      switchOn: payload.switchOn ? 1 : 0,
      progressYear: currentYear(),
    })
    .where(eq(annualPayments.id, paymentId))

  return NextResponse.json(await loadAnnualPayments())
}
