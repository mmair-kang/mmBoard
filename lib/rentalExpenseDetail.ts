// 수정: Auto — 2026-07-19 13:00 (렌탈 계약정보)

import dayjs from 'dayjs'

/** 렌탈 계약내역 */
export type RentalDetail = {
  kind: 'rental'
  /** 요금제·상품명 (선택) */
  planName: string
  /** 약정기간 시작 (YYYY-MM-DD) */
  periodStart: string
  /** 약정기간 종료 (YYYY-MM-DD) */
  periodEnd: string
  /** 소유권 도래일 (YYYY-MM-DD) */
  ownershipDate: string
  /** 관리 유형 (예: 자가관리) */
  managementType: string
  /** 월 렌탈료 (고정비 금액) */
  monthlyFee: number
}

export function defaultRentalDetail(): RentalDetail {
  return {
    kind: 'rental',
    planName: '',
    periodStart: '',
    periodEnd: '',
    ownershipDate: '',
    managementType: '',
    monthlyFee: 0,
  }
}

function nonNegRound(n: unknown): number {
  const v = Math.round(Number(n))
  if (!Number.isFinite(v) || v < 0) return 0
  return v
}

function asString(n: unknown): string {
  return typeof n === 'string' ? n.trim() : ''
}

function asDate(n: unknown): string {
  const text = asString(n).slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  // 2025.11.21 형태도 허용
  const dotted = text.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/)
  if (dotted) {
    const y = dotted[1]
    const m = dotted[2].padStart(2, '0')
    const d = dotted[3].padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return asString(n)
}

export function rentalGrandTotal(detail: RentalDetail): number {
  return Math.max(0, Math.round(detail.monthlyFee))
}

export function parseRentalDetail(raw: unknown): RentalDetail | null {
  let value: unknown = raw
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return null
    try {
      value = JSON.parse(trimmed) as unknown
    } catch {
      return null
    }
  }
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if (row.kind !== 'rental') {
    if (
      Array.isArray(row.sections) ||
      row.kind === 'regionalHealth' ||
      row.kind === 'nationalPension' ||
      row.kind === 'privateInsurance'
    ) {
      return null
    }
    if (row.monthlyFee == null && row.periodStart == null && row.planName == null) return null
  }

  return {
    kind: 'rental',
    planName: asString(row.planName),
    periodStart: asDate(row.periodStart),
    periodEnd: asDate(row.periodEnd),
    ownershipDate: asDate(row.ownershipDate),
    managementType: asString(row.managementType),
    monthlyFee: nonNegRound(row.monthlyFee),
  }
}

export function rentalDetailForDb(detail: RentalDetail | null | undefined): string | null {
  if (!detail) return null
  return JSON.stringify(detail)
}

export function formatRentalDate(isoOrText: string): string {
  const text = isoOrText.trim()
  if (!text) return '-'
  const d = dayjs(text)
  if (d.isValid()) return d.format('YYYY.MM.DD')
  return text
}

export function formatRentalPeriod(detail: RentalDetail): string {
  const start = formatRentalDate(detail.periodStart)
  const end = formatRentalDate(detail.periodEnd)
  if (start === '-' && end === '-') return '-'
  if (start === '-') return `~ ${end}`
  if (end === '-') return `${start} ~`
  return `${start} ~ ${end}`
}

/** 약정 종료까지 남은 일수 */
export function getRentalPeriodDaysRemaining(
  periodEnd: string,
  today = dayjs(),
): number | null {
  if (!periodEnd.trim()) return null
  const end = dayjs(periodEnd).startOf('day')
  if (!end.isValid()) return null
  return end.diff(today.startOf('day'), 'day')
}

export function formatRentalPeriodRemaining(periodEnd: string, today = dayjs()): string | null {
  const days = getRentalPeriodDaysRemaining(periodEnd, today)
  if (days == null) return null
  if (days > 0) return `${days}일 남음`
  if (days === 0) return '오늘 종료'
  return '종료됨'
}
