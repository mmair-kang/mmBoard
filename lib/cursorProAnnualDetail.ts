// 수정: Auto — 2026-07-19 15:10 (연납 Cursor PRO 상세)

import dayjs, { type Dayjs } from 'dayjs'

export const DEFAULT_CURSOR_PRO_PLAN = 'Pro'
export const DEFAULT_CURSOR_PRO_USD = 192
export const DEFAULT_CURSOR_PRO_RESET_DAY = 1
/** USD→KRW 기본 환산 (연납 합계용) */
export const DEFAULT_CURSOR_PRO_USD_KRW = 1400

export type CursorProAnnualDetail = {
  kind: 'cursorPro'
  /** 요금제명 */
  planName: string
  /** 연간 요금 (USD) */
  annualUsd: number
  /** 매달 리셋일 1–31 */
  resetDay: number
  /** 마지막 결제일 (YYYY-MM-DD) */
  lastPaidOn: string
  /** 연납 원화 (합계용). 0이면 USD×환율 사용 */
  amountKrw: number
}

export function defaultCursorProAnnualDetail(): CursorProAnnualDetail {
  return {
    kind: 'cursorPro',
    planName: DEFAULT_CURSOR_PRO_PLAN,
    annualUsd: DEFAULT_CURSOR_PRO_USD,
    resetDay: DEFAULT_CURSOR_PRO_RESET_DAY,
    lastPaidOn: '',
    amountKrw: Math.round(DEFAULT_CURSOR_PRO_USD * DEFAULT_CURSOR_PRO_USD_KRW),
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

function parseDay(n: unknown): number {
  const v = Math.round(Number(n))
  if (!Number.isFinite(v)) return DEFAULT_CURSOR_PRO_RESET_DAY
  return Math.min(31, Math.max(1, v))
}

function parseUsd(n: unknown): number {
  const v = Number(n)
  if (!Number.isFinite(v) || v < 0) return DEFAULT_CURSOR_PRO_USD
  return Math.round(v * 100) / 100
}

export function cursorProAnnualGrandTotal(detail: CursorProAnnualDetail): number {
  if (detail.amountKrw > 0) return Math.round(detail.amountKrw)
  return Math.max(1, Math.round(detail.annualUsd * DEFAULT_CURSOR_PRO_USD_KRW))
}

export function parseCursorProAnnualDetail(raw: unknown): CursorProAnnualDetail | null {
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
  if (row.kind != null && row.kind !== 'cursorPro') return null

  const annualUsd = parseUsd(row.annualUsd)
  const amountKrwRaw = nonNegRound(row.amountKrw)

  return {
    kind: 'cursorPro',
    planName: asString(row.planName) || DEFAULT_CURSOR_PRO_PLAN,
    annualUsd,
    resetDay: parseDay(row.resetDay),
    lastPaidOn: asString(row.lastPaidOn),
    amountKrw: amountKrwRaw > 0 ? amountKrwRaw : Math.round(annualUsd * DEFAULT_CURSOR_PRO_USD_KRW),
  }
}

export function cursorProAnnualDetailForDb(
  detail: CursorProAnnualDetail | null | undefined,
): string | null {
  if (!detail) return null
  return JSON.stringify(detail)
}

export function formatCursorProDateKo(iso: string): string {
  if (!iso) return '-'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  return `${Number(match[1])}년 ${Number(match[2])}월 ${Number(match[3])}일`
}

export function formatCursorProUsd(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  return `$${rounded.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

export function getCursorProNextPaymentDate(lastPaidOn: string): Dayjs | null {
  if (!lastPaidOn) return null
  const paid = dayjs(lastPaidOn)
  if (!paid.isValid()) return null
  return paid.add(1, 'year')
}

/** 다음 리셋일 (이번 달 해당일 또는 다음 달) */
export function getCursorProNextResetDate(resetDay: number, from: Dayjs = dayjs()): Dayjs {
  const day = Math.min(31, Math.max(1, resetDay))
  const start = from.startOf('day')
  let candidate = start.date(Math.min(day, start.daysInMonth()))
  if (candidate.isBefore(start) || candidate.isSame(start, 'day')) {
    // 오늘이 리셋일이면 "오늘"로 두고, 이미 지났으면 다음 달
    if (candidate.isBefore(start)) {
      const nextMonth = start.add(1, 'month')
      candidate = nextMonth.date(Math.min(day, nextMonth.daysInMonth()))
    }
  }
  return candidate.startOf('day')
}

export function calcDaysRemaining(target: Dayjs, from: Dayjs = dayjs()): number {
  return target.startOf('day').diff(from.startOf('day'), 'day')
}

export function formatDaysRemainingLabel(days: number): string {
  if (days === 0) return '오늘'
  if (days > 0) return `${days}일 남음`
  return `${Math.abs(days)}일 지남`
}

export function getCursorProScheduleInfo(detail: CursorProAnnualDetail, from: Dayjs = dayjs()) {
  const nextReset = getCursorProNextResetDate(detail.resetDay, from)
  const resetDays = calcDaysRemaining(nextReset, from)
  const nextPayment = getCursorProNextPaymentDate(detail.lastPaidOn)
  const paymentDays = nextPayment ? calcDaysRemaining(nextPayment, from) : null

  return {
    nextReset,
    resetDays,
    resetLabel: formatDaysRemainingLabel(resetDays),
    nextPayment,
    paymentDays,
    paymentLabel: paymentDays == null ? null : formatDaysRemainingLabel(paymentDays),
  }
}
