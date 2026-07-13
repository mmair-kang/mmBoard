// 수정: Auto — 2026-07-12 23:36
import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { parseCardApplicationPayload } from '@/lib/cardApplicationPayload'
import { mapCardApplicationRow } from '@/lib/cardApplicationQuery'
import { ensureCardApplicationSchema } from '@/lib/cardApplicationSchema'
import { db } from '@/lib/db'
import { cardApplications } from '@/lib/schema'

export async function GET() {
  await ensureCardApplicationSchema()
  const rows = await db.select().from(cardApplications).orderBy(desc(cardApplications.createdAt))
  return NextResponse.json(rows.map(mapCardApplicationRow))
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseCardApplicationPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureCardApplicationSchema()
    const rows = await db
      .insert(cardApplications)
      .values({
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
        createdAt: new Date().toISOString(),
      })
      .returning()

    if (!rows[0]) {
      return NextResponse.json({ message: 'insert failed' }, { status: 500 })
    }

    return NextResponse.json(mapCardApplicationRow(rows[0]))
  } catch (error) {
    console.error('[card-applications POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
