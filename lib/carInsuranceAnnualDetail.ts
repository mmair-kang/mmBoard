// 수정: Auto — 2026-07-19 14:40 (연납 자동차보험 상세)

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `car_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

/** 보장 항목 (대인배상I 등) */
export type CarInsuranceCoverageRow = {
  id: string
  /** 담보명 */
  name: string
  /** 가입금액·한도 설명 */
  limitLabel: string
  /** 부가 설명 (예: 차량단독 사고 보장) */
  note: string
  /** 보험료 */
  premium: number
}

/** 연납 자동차보험 상세 */
export type CarInsuranceAnnualDetail = {
  kind: 'carInsurance'
  /** 보험상품명 */
  productName: string
  /** 보험기간 만료일 (YYYY-MM-DD) — 1년 단위 */
  expiresOn: string
  /** 특약 · 할인할증 (예: 26Z) */
  discountGrade: string
  /** 특약 · 물적사고기준 (예: 200만원) */
  propertyDamageBase: string
  coverages: CarInsuranceCoverageRow[]
}

export function emptyCarInsuranceCoverage(
  name = '',
  limitLabel = '',
  note = '',
  premium = 0,
): CarInsuranceCoverageRow {
  return { id: newId(), name, limitLabel, note, premium }
}

export function defaultCarInsuranceCoverages(): CarInsuranceCoverageRow[] {
  return [
    emptyCarInsuranceCoverage('대인배상I', '1억5천만원'),
    emptyCarInsuranceCoverage('대인배상II', '무한'),
    emptyCarInsuranceCoverage('대물', '10억원'),
    emptyCarInsuranceCoverage('자동차상해', '2억원/3천만원'),
    emptyCarInsuranceCoverage('무보험자동차에 의한 상해', '2억원'),
    emptyCarInsuranceCoverage('자기차량손해(포괄)', '손해액의 20%(최소 20만원 ~ 최대 50만원)', '차량단독 사고 보장'),
    emptyCarInsuranceCoverage('긴급출동서비스담보', '긴급출동서비스'),
  ]
}

export function defaultCarInsuranceAnnualDetail(): CarInsuranceAnnualDetail {
  return {
    kind: 'carInsurance',
    productName: '',
    expiresOn: '',
    discountGrade: '',
    propertyDamageBase: '',
    coverages: defaultCarInsuranceCoverages(),
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

function parseCoverage(raw: unknown): CarInsuranceCoverageRow | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  return {
    id: asString(row.id) || newId(),
    name: asString(row.name),
    limitLabel: asString(row.limitLabel),
    note: asString(row.note),
    premium: nonNegRound(row.premium),
  }
}

export function carInsuranceAnnualGrandTotal(detail: CarInsuranceAnnualDetail): number {
  return detail.coverages.reduce((sum, row) => sum + Math.max(0, Math.round(row.premium)), 0)
}

export function parseCarInsuranceAnnualDetail(raw: unknown): CarInsuranceAnnualDetail | null {
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
  if (row.kind != null && row.kind !== 'carInsurance') return null

  const coveragesRaw = Array.isArray(row.coverages) ? row.coverages : []
  const coverages = coveragesRaw
    .map(parseCoverage)
    .filter((item): item is CarInsuranceCoverageRow => item != null)

  return {
    kind: 'carInsurance',
    productName: asString(row.productName),
    expiresOn: asString(row.expiresOn),
    discountGrade: asString(row.discountGrade),
    propertyDamageBase: asString(row.propertyDamageBase),
    coverages: coverages.length > 0 ? coverages : defaultCarInsuranceCoverages(),
  }
}

export function carInsuranceAnnualDetailForDb(
  detail: CarInsuranceAnnualDetail | null | undefined,
): string | null {
  if (!detail) return null
  return JSON.stringify(detail)
}

export function formatCarInsuranceExpiry(iso: string): string {
  if (!iso) return '-'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  return `${match[1]}.${match[2]}.${match[3]}`
}
