// 수정: Auto — 2026-07-19 13:15 (대출잔액 자산 연동 오버라이드)
// 수정: Auto — 2026-07-19 13:05 (한달 고정비 보금자리론 상세)

import {
  BOGEUMJARI_LOAN_MATURITY,
  BOGEUMJARI_LOAN_PRODUCT,
  BOGEUMJARI_LOAN_REPAYMENT,
  BOGEUMJARI_LOAN_START,
  calcBogeumjariLoanPaymentBreakdown,
} from '@/lib/bogeumjariLoanCalc'

export const DEFAULT_BOGEUMJARI_EXPENSE_RATE = 2.23
export const DEFAULT_BOGEUMJARI_EXPENSE_PAYMENT = 650_000
export const DEFAULT_BOGEUMJARI_EXPENSE_DAY = 28

/** 보금자리론 고정비 상세 */
export type BogeumjariDetail = {
  kind: 'bogeumjari'
  productName: string
  loanStart: string
  loanMaturity: string
  repaymentMethod: string
  /** 연 금리 % */
  annualRatePercent: number
  /** 매월 납부일 1–31 */
  paymentDay: number
  /** 대출잔액 (원금·이자 분해용) */
  loanBalance: number
  /** 월 상환액 = 고정비 금액 */
  monthlyPayment: number
}

export function defaultBogeumjariDetail(): BogeumjariDetail {
  return {
    kind: 'bogeumjari',
    productName: BOGEUMJARI_LOAN_PRODUCT,
    loanStart: BOGEUMJARI_LOAN_START,
    loanMaturity: BOGEUMJARI_LOAN_MATURITY,
    repaymentMethod: BOGEUMJARI_LOAN_REPAYMENT,
    annualRatePercent: DEFAULT_BOGEUMJARI_EXPENSE_RATE,
    paymentDay: DEFAULT_BOGEUMJARI_EXPENSE_DAY,
    loanBalance: 0,
    monthlyPayment: DEFAULT_BOGEUMJARI_EXPENSE_PAYMENT,
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

function parseRate(n: unknown): number {
  const v = Number(n)
  if (!Number.isFinite(v) || v < 0) return DEFAULT_BOGEUMJARI_EXPENSE_RATE
  return Math.round(Math.min(100, v) * 100) / 100
}

function parseDay(n: unknown): number {
  const v = Math.round(Number(n))
  if (!Number.isFinite(v)) return DEFAULT_BOGEUMJARI_EXPENSE_DAY
  return Math.min(31, Math.max(1, v))
}

export function bogeumjariGrandTotal(detail: BogeumjariDetail): number {
  return Math.max(0, Math.round(detail.monthlyPayment))
}

export function parseBogeumjariDetail(raw: unknown): BogeumjariDetail | null {
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
  if (row.kind !== 'bogeumjari') {
    if (
      Array.isArray(row.sections) ||
      row.kind === 'regionalHealth' ||
      row.kind === 'nationalPension' ||
      row.kind === 'privateInsurance' ||
      row.kind === 'rental'
    ) {
      return null
    }
    if (row.monthlyPayment == null && row.loanBalance == null && row.annualRatePercent == null) {
      return null
    }
  }

  return {
    kind: 'bogeumjari',
    productName: asString(row.productName) || BOGEUMJARI_LOAN_PRODUCT,
    loanStart: asString(row.loanStart) || BOGEUMJARI_LOAN_START,
    loanMaturity: asString(row.loanMaturity) || BOGEUMJARI_LOAN_MATURITY,
    repaymentMethod: asString(row.repaymentMethod) || BOGEUMJARI_LOAN_REPAYMENT,
    annualRatePercent: parseRate(row.annualRatePercent),
    paymentDay: parseDay(row.paymentDay),
    loanBalance: nonNegRound(row.loanBalance),
    monthlyPayment: nonNegRound(row.monthlyPayment) || DEFAULT_BOGEUMJARI_EXPENSE_PAYMENT,
  }
}

export function bogeumjariDetailForDb(detail: BogeumjariDetail | null | undefined): string | null {
  if (!detail) return null
  return JSON.stringify(detail)
}

/** loanBalanceOverride: 자산 페이지 대출잔액 등 외부 잔액 사용 */
export function getBogeumjariBreakdown(detail: BogeumjariDetail, loanBalanceOverride?: number) {
  return calcBogeumjariLoanPaymentBreakdown(
    loanBalanceOverride ?? detail.loanBalance,
    detail.annualRatePercent,
    detail.monthlyPayment,
  )
}
