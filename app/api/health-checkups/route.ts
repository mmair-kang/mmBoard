// 수정: Auto — 2026-07-27 01:56

import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { sortHealthCheckupsByDateDesc } from '@/lib/healthCheckupFormat'
import { parseHealthCheckupPayload } from '@/lib/healthCheckupPayload'
import { ensureHealthCheckupSchema } from '@/lib/healthCheckupSchema'
import { healthCheckups } from '@/lib/schema'

export async function GET() {
  await ensureHealthCheckupSchema()
  const rows = await db.select().from(healthCheckups)
  return NextResponse.json(sortHealthCheckupsByDateDesc(rows))
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseHealthCheckupPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureHealthCheckupSchema()
    const rows = await db
      .insert(healthCheckups)
      .values({
        checkupDate: payload.checkupDate,
        age: payload.age,
        heightCm: payload.heightCm,
        weightKg: payload.weightKg,
        bmi: payload.bmi,
        waistCm: payload.waistCm,
        visionLeft: payload.visionLeft,
        visionRight: payload.visionRight,
        bpSystolic: payload.bpSystolic,
        bpDiastolic: payload.bpDiastolic,
        fastingGlucose: payload.fastingGlucose,
        totalCholesterol: payload.totalCholesterol,
        hdl: payload.hdl,
        triglycerides: payload.triglycerides,
        ldl: payload.ldl,
        createdAt: new Date().toISOString(),
      })
      .returning()

    if (!rows[0]) {
      return NextResponse.json({ message: 'insert failed' }, { status: 500 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('[health-checkups POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
