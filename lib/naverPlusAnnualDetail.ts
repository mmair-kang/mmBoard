// 수정: Auto — 2026-07-19 16:00 (연납 네이버플러스 멤버십 상세)

import dayjs, { type Dayjs } from 'dayjs'

export const DEFAULT_NAVER_PLUS_PLAN = '네이버플러스 멤버십'

export type NaverPlusAnnualDetail = {
  kind: 'naverPlus'
  /** 멤버십·요금제명 */
  planName: string
  /** 연간 결제금액 (원) */
  amountKrw: number
  /** 마지막 결제일 (YYYY-MM-DD) */
  lastPaidOn: string
}

export function defaultNaverPlusAnnualDetail(): NaverPlusAnnualDetail {
  return {
    kind: 'naverPlus',
    planName: DEFAULT_NAVER_PLUS_PLAN,
    amountKrw: 0,
    lastPaidOn: '',
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

export function naverPlusAnnualGrandTotal(detail: NaverPlusAnnualDetail): number {
  return Math.max(0, Math.round(detail.amountKrw))
}

export function parseNaverPlusAnnualDetail(raw: unknown): NaverPlusAnnualDetail | null {
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
  if (row.kind != null && row.kind !== 'naverPlus') return null

  return {
    kind: 'naverPlus',
    planName: asString(row.planName) || DEFAULT_NAVER_PLUS_PLAN,
    amountKrw: nonNegRound(row.amountKrw),
    lastPaidOn: asString(row.lastPaidOn),
  }
}

export function naverPlusAnnualDetailForDb(
  detail: NaverPlusAnnualDetail | null | undefined,
): string | null {
  if (!detail) return null
  return JSON.stringify(detail)
}

export function formatNaverPlusDateKo(iso: string): string {
  if (!iso) return '-'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  return `${Number(match[1])}년 ${Number(match[2])}월 ${Number(match[3])}일`
}

/** YY. M. D 형식 (예: 26. 10. 1) */
export function formatNaverPlusDateShort(iso: string): string {
  if (!iso) return '-'
  const d = dayjs(iso)
  if (!d.isValid()) return iso
  return `${String(d.year()).slice(2)}. ${d.month() + 1}. ${d.date()}`
}

export function getNaverPlusNextPaymentDate(lastPaidOn: string): Dayjs | null {
  if (!lastPaidOn) return null
  const paid = dayjs(lastPaidOn)
  if (!paid.isValid()) return null
  return paid.add(1, 'year')
}

export function calcNaverPlusDaysRemaining(target: Dayjs, from: Dayjs = dayjs()): number {
  return target.startOf('day').diff(from.startOf('day'), 'day')
}

export function formatNaverPlusDaysRemainingLabel(days: number): string {
  if (days === 0) return '오늘'
  if (days > 0) return `${days}일 남음`
  return `${Math.abs(days)}일 지남`
}

export function getNaverPlusScheduleInfo(detail: NaverPlusAnnualDetail, from: Dayjs = dayjs()) {
  const nextPayment = getNaverPlusNextPaymentDate(detail.lastPaidOn)
  const paymentDays = nextPayment ? calcNaverPlusDaysRemaining(nextPayment, from) : null

  return {
    nextPayment,
    paymentDays,
    paymentLabel: paymentDays == null ? null : formatNaverPlusDaysRemainingLabel(paymentDays),
  }
}
