// 수정: Auto — 2026-07-12 23:36
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { parseCardApplicationPayload } from '@/lib/cardApplicationPayload'
import { mapCardApplicationRow } from '@/lib/cardApplicationQuery'
import { ensureCardApplicationSchema } from '@/lib/cardApplicationSchema'
import { db } from '@/lib/db'
import { cardApplications } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseCardApplicationPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureCardApplicationSchema()
  const rows = await db
    .update(cardApplications)
    .set({
      platform: payload.platform,
      cardCompany: payload.cardCompany,
      cardName: payload.cardName,
      applicationBlocked: payload.applicationBlocked ? 1 : 0,
      blockedReason: payload.blockedReason,
      blockedConfirmedDate: payload.blockedConfirmedDate,
      annualFee: payload.annualFee,
      spendAmount: payload.spendAmount,
      benefitAmount: payload.benefitAmount,
      usageStartDate: payload.usageStartDate,
      usageEndDate: payload.usageEndDate,
      benefitDate: payload.benefitDate,
      withdrawalRestrictPeriod: payload.withdrawalRestrictPeriod,
      cancelDate: payload.cancelDate,
    })
    .where(eq(cardApplications.id, itemId))
    .returning()

  if (rows.length === 0) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  return NextResponse.json(mapCardApplicationRow(rows[0]))
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  await ensureCardApplicationSchema()
  await db.delete(cardApplications).where(eq(cardApplications.id, itemId))
  return NextResponse.json({ ok: true })
}
