// 수정: Auto — 2026-07-27 01:56

import { calcBmi } from '@/lib/healthCheckupFormat'
import { parseLastPurchaseDate } from '@/lib/shoppingDate'

export type HealthCheckupPayload = {
  checkupDate: string
  age: number | null
  heightCm: number | null
  weightKg: number | null
  bmi: number | null
  waistCm: number | null
  visionLeft: number | null
  visionRight: number | null
  bpSystolic: number | null
  bpDiastolic: number | null
  fastingGlucose: number | null
  totalCholesterol: number | null
  hdl: number | null
  triglycerides: number | null
  ldl: number | null
}

function parseOptionalNumber(value: unknown): number | null | undefined {
  if (value == null || value === '') return null
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().replace(/,/g, '')
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

function parseOptionalInt(value: unknown): number | null | undefined {
  const n = parseOptionalNumber(value)
  if (n === undefined) return undefined
  if (n === null) return null
  if (!Number.isInteger(n)) return undefined
  return n
}

export function parseHealthCheckupPayload(body: Record<string, unknown>): HealthCheckupPayload | null {
  const checkupDate = parseLastPurchaseDate(body.checkupDate)
  if (!checkupDate) return null

  const age = parseOptionalInt(body.age)
  const heightCm = parseOptionalNumber(body.heightCm)
  const weightKg = parseOptionalNumber(body.weightKg)
  const waistCm = parseOptionalNumber(body.waistCm)
  const visionLeft = parseOptionalNumber(body.visionLeft)
  const visionRight = parseOptionalNumber(body.visionRight)
  const bpSystolic = parseOptionalInt(body.bpSystolic)
  const bpDiastolic = parseOptionalInt(body.bpDiastolic)
  const fastingGlucose = parseOptionalNumber(body.fastingGlucose)
  const totalCholesterol = parseOptionalNumber(body.totalCholesterol)
  const hdl = parseOptionalNumber(body.hdl)
  const triglycerides = parseOptionalNumber(body.triglycerides)
  const ldl = parseOptionalNumber(body.ldl)
  let bmi = parseOptionalNumber(body.bmi)

  if (
    age === undefined ||
    heightCm === undefined ||
    weightKg === undefined ||
    waistCm === undefined ||
    visionLeft === undefined ||
    visionRight === undefined ||
    bpSystolic === undefined ||
    bpDiastolic === undefined ||
    fastingGlucose === undefined ||
    totalCholesterol === undefined ||
    hdl === undefined ||
    triglycerides === undefined ||
    ldl === undefined ||
    bmi === undefined
  ) {
    return null
  }

  if (bmi == null && heightCm != null && weightKg != null) {
    bmi = calcBmi(heightCm, weightKg)
  }

  return {
    checkupDate,
    age,
    heightCm,
    weightKg,
    bmi,
    waistCm,
    visionLeft,
    visionRight,
    bpSystolic,
    bpDiastolic,
    fastingGlucose,
    totalCholesterol,
    hdl,
    triglycerides,
    ldl,
  }
}
