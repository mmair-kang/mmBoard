// 수정: Auto — 2026-07-27 01:56

import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { parseHealthCheckupPayload } from '@/lib/healthCheckupPayload'
import { ensureHealthCheckupSchema } from '@/lib/healthCheckupSchema'
import { healthCheckups } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseHealthCheckupPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureHealthCheckupSchema()
  const rows = await db
    .update(healthCheckups)
    .set({
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
    })
    .where(eq(healthCheckups.id, itemId))
    .returning()

  if (rows.length === 0) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  await ensureHealthCheckupSchema()
  await db.delete(healthCheckups).where(eq(healthCheckups.id, itemId))
  return NextResponse.json({ ok: true })
}
