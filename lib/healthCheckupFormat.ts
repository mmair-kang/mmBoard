// 수정: Auto — 2026-07-27 01:56

import dayjs from 'dayjs'

/** 정상 참고 범위 (시트 「정상 라인」) */
export const HEALTH_CHECKUP_REFS = {
  fastingGlucose: { label: '100 미만', maxExclusive: 100 },
  totalCholesterol: { label: '200 미만', maxExclusive: 200 },
  hdl: { label: '60 이상', minInclusive: 60 },
  triglycerides: { label: '150 미만', maxExclusive: 150 },
  ldl: { label: '130 미만', maxExclusive: 130 },
} as const

export type HealthCheckupRefKey = keyof typeof HEALTH_CHECKUP_REFS

export function calcBmi(heightCm: number | null | undefined, weightKg: number | null | undefined): number | null {
  if (heightCm == null || weightKg == null) return null
  if (!(heightCm > 0) || !(weightKg > 0)) return null
  const m = heightCm / 100
  const bmi = weightKg / (m * m)
  return Math.round(bmi * 10) / 10
}

/** 시트 표기: 2026. 3. 30 */
export function formatCheckupDateLabel(isoDate: string): string {
  const d = dayjs(isoDate)
  if (!d.isValid()) return isoDate
  return `${d.year()}. ${d.month() + 1}. ${d.date()}`
}

export function formatCheckupNumber(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—'
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(digits).replace(/\.0$/, '')
}

export type RefStatus = 'ok' | 'warn' | 'unknown'

export function checkupRefStatus(key: HealthCheckupRefKey, value: number | null | undefined): RefStatus {
  if (value == null || !Number.isFinite(value)) return 'unknown'
  const ref = HEALTH_CHECKUP_REFS[key]
  if ('maxExclusive' in ref && ref.maxExclusive != null) {
    return value < ref.maxExclusive ? 'ok' : 'warn'
  }
  if ('minInclusive' in ref && ref.minInclusive != null) {
    return value >= ref.minInclusive ? 'ok' : 'warn'
  }
  return 'unknown'
}

export function sortHealthCheckupsByDateDesc<T extends { checkupDate: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.checkupDate === b.checkupDate) return 0
    return a.checkupDate < b.checkupDate ? 1 : -1
  })
}
