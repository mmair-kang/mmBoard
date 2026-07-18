// 수정: Auto — 2026-07-19 03:45 (납입내역·납입방법 제거, 횟수·최종월 자동)
// 수정: Auto — 2026-07-19 03:40 (민간보험 계약·보장·납입)

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `ins_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export type InsuranceCoverageRow = {
  id: string
  /** 대상자(피보험자) */
  insuredName: string
  /** 가입담보 */
  coverageName: string
  /** 보장금액 */
  amount: number
}

/** 보험 계약내역상세 */
export type InsuranceDetail = {
  kind: 'privateInsurance'
  /** 증권번호 */
  policyNumber: string
  /** 상품명(선택 — 고정비 이름과 별도) */
  productName: string
  /** 보험기간 시작 */
  periodStart: string
  /** 보험기간 종료 */
  periodEnd: string
  /** 보험료(월납 고정비 금액) */
  premium: number
  /** 납입기간 (예: 20년납) */
  paymentTerm: string
  /** 계약자 */
  contractorName: string
  /** 피보험자 */
  insuredName: string
  coverages: InsuranceCoverageRow[]
}

export function emptyInsuranceCoverage(insuredName = ''): InsuranceCoverageRow {
  return { id: newId(), insuredName, coverageName: '', amount: 0 }
}

export function defaultInsuranceDetail(): InsuranceDetail {
  return {
    kind: 'privateInsurance',
    policyNumber: '',
    productName: '',
    periodStart: '',
    periodEnd: '',
    premium: 0,
    paymentTerm: '',
    contractorName: '',
    insuredName: '',
    coverages: [emptyInsuranceCoverage()],
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

function parseCoverage(raw: unknown): InsuranceCoverageRow | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  return {
    id: asString(row.id) || newId(),
    insuredName: asString(row.insuredName),
    coverageName: asString(row.coverageName),
    amount: nonNegRound(row.amount),
  }
}

/** 현재 최종납입월 표기: 2026년 7월 */
export function getInsuranceCurrentPaidMonthLabel(now = new Date()): string {
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`
}

/** 2017.09.28 / 2017-09-28 / 2017.09 / 2017년 9월 등 → {year, month} */
export function parseInsuranceYearMonth(raw: string): { year: number; month: number } | null {
  const text = raw.trim()
  if (!text) return null

  const korean = text.match(/(\d{4})\s*년\s*(\d{1,2})\s*월/)
  if (korean) {
    const year = Number(korean[1])
    const month = Number(korean[2])
    if (year >= 1900 && month >= 1 && month <= 12) return { year, month }
  }

  const dotted = text.match(/(\d{4})[.\-/](\d{1,2})(?:[.\-/]\d{1,2})?/)
  if (dotted) {
    const year = Number(dotted[1])
    const month = Number(dotted[2])
    if (year >= 1900 && month >= 1 && month <= 12) return { year, month }
  }

  return null
}

/** 납입기간 문자열에서 최대 납입 횟수 (20년납 → 240) */
export function maxPaymentCountFromTerm(paymentTerm: string): number | null {
  const yearMatch = paymentTerm.match(/(\d+)\s*년/)
  if (yearMatch) {
    const years = Number(yearMatch[1])
    if (Number.isFinite(years) && years > 0) return years * 12
  }
  const countMatch = paymentTerm.match(/(\d+)\s*회/)
  if (countMatch) {
    const count = Number(countMatch[1])
    if (Number.isFinite(count) && count > 0) return count
  }
  return null
}

/**
 * 보험기간 시작월부터 현재월까지 매달 납입 가정(포함).
 * 납입기간(N년납)이 있으면 그 횟수로 상한.
 */
export function computeInsurancePaymentCount(
  periodStart: string,
  paymentTerm = '',
  now = new Date(),
): number {
  const start = parseInsuranceYearMonth(periodStart)
  if (!start) return 0

  const endYear = now.getFullYear()
  const endMonth = now.getMonth() + 1
  let count = (endYear - start.year) * 12 + (endMonth - start.month) + 1
  if (count < 0) count = 0

  const max = maxPaymentCountFromTerm(paymentTerm)
  if (max != null) count = Math.min(count, max)
  return count
}

export type InsurancePaymentAutoInfo = {
  lastPaidMonthLabel: string
  paymentCount: number
  paymentCycle: string
}

export function getInsurancePaymentAutoInfo(
  detail: Pick<InsuranceDetail, 'periodStart' | 'paymentTerm'>,
  now = new Date(),
): InsurancePaymentAutoInfo {
  return {
    lastPaidMonthLabel: getInsuranceCurrentPaidMonthLabel(now),
    paymentCount: computeInsurancePaymentCount(detail.periodStart, detail.paymentTerm, now),
    paymentCycle: '월납',
  }
}

export function insuranceGrandTotal(detail: InsuranceDetail): number {
  return Math.max(0, Math.round(detail.premium))
}

export function parseInsuranceDetail(raw: unknown): InsuranceDetail | null {
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
  if (row.kind !== 'privateInsurance') {
    if (Array.isArray(row.sections) || row.kind === 'regionalHealth' || row.kind === 'nationalPension') {
      return null
    }
    if (row.premium == null && row.policyNumber == null && !Array.isArray(row.coverages)) {
      return null
    }
  }

  const coveragesRaw = Array.isArray(row.coverages) ? row.coverages : []
  const coverages: InsuranceCoverageRow[] = []
  for (const c of coveragesRaw) {
    const parsed = parseCoverage(c)
    if (parsed) coverages.push(parsed)
  }

  return {
    kind: 'privateInsurance',
    policyNumber: asString(row.policyNumber),
    productName: asString(row.productName),
    periodStart: asString(row.periodStart),
    periodEnd: asString(row.periodEnd),
    premium: nonNegRound(row.premium),
    paymentTerm: asString(row.paymentTerm),
    contractorName: asString(row.contractorName),
    insuredName: asString(row.insuredName),
    coverages: coverages.length > 0 ? coverages : [emptyInsuranceCoverage()],
  }
}

export function insuranceDetailForDb(detail: InsuranceDetail | null | undefined): string | null {
  if (!detail) return null
  return JSON.stringify(detail)
}

export function formatInsurancePeriod(detail: InsuranceDetail): string {
  const start = detail.periodStart.trim()
  const end = detail.periodEnd.trim()
  if (start && end) return `${start} ~ ${end}`
  if (start) return `${start} ~`
  if (end) return `~ ${end}`
  return '-'
}
