// 수정: Auto — 2026-07-19 10:15 (⑥ 건강보험료 원단위 내림)
// 수정: Auto — 2026-07-19 10:10 (⑧ 원단위(10원) 내림)
// 수정: Auto — 2026-07-19 10:05 (⑧=(①+(②×③))×요율, 소수 입력)
// 수정: Auto — 2026-07-19 10:00 (⑧ 장기요양 = (①+③)×요율 절사)
// 수정: Auto — 2026-07-19 03:25 (재산보험료 절사·최종 10원 절사)
// 수정: Auto — 2026-07-19 03:15 (지역가입자 고지서 ①~⑨)

/** 지역가입자 건강보험료 고지서(부과 상세내역) 입력값 */
export type HealthInsuranceDetail = {
  kind: 'regionalHealth'
  /** ① 소득월액보험료 */
  incomePremium: number
  /** ② 재산 점수 */
  propertyPoints: number
  /** 재산보험료 점수당 단가 (고지서 ③ 산식의 배수, 예: 211.5) */
  propertyPointUnit: number
  /** ④ 경감·정지·제외 */
  reduction: number
  /** ⑤ 한시적 감액 */
  temporaryReduction: number
  /** ⑦ 건강 면제·지원금 */
  healthExemption: number
  /** ⑧ 장기요양보험료율 (%) — 예: 13.14 */
  longTermCareRate: number
  /** ⑨ 장기 면제·지원금 */
  longTermCareExemption: number
}

/** 계산된 고지서 행 */
export type HealthInsuranceComputed = {
  /** ③ 재산보험료 = ② × 단가 (원단위 절사) */
  propertyPremium: number
  /** ⑥ 건강보험료 = (①+③)−(④+⑤) 후 원단위(10원) 내림 */
  healthPremium: number
  /** ⑧ 장기요양보험료 = (①+(②×③))×요율% 후 원단위(10원) 내림 */
  longTermCarePremium: number
  /** 계 납부보험료 = (⑥−⑦)+(⑧−⑨), 10원 미만 절사 */
  totalPayable: number
}

export const DEFAULT_PROPERTY_POINT_UNIT = 211.5

export function defaultHealthInsuranceDetail(): HealthInsuranceDetail {
  return {
    kind: 'regionalHealth',
    incomePremium: 0,
    propertyPoints: 0,
    propertyPointUnit: DEFAULT_PROPERTY_POINT_UNIT,
    reduction: 0,
    temporaryReduction: 0,
    healthExemption: 0,
    longTermCareRate: 0,
    longTermCareExemption: 0,
  }
}

function nonNegRound(n: unknown): number {
  const v = Math.round(Number(n))
  if (!Number.isFinite(v) || v < 0) return 0
  return v
}

function nonNegNumber(n: unknown): number {
  const v = Number(n)
  if (!Number.isFinite(v) || v < 0) return 0
  return v
}

export function computeHealthInsurance(detail: HealthInsuranceDetail): HealthInsuranceComputed {
  // ③ 재산보험료 = ② × 단가 (원단위 절사)
  const rawPropertyPremium = detail.propertyPoints * detail.propertyPointUnit
  const propertyPremium = Math.floor(rawPropertyPremium)
  // ⑧ 장기요양 = (① + (②×③)) × 장기요양보험료율% → 원단위(10원) 내림
  const baseForLtc = detail.incomePremium + rawPropertyPremium
  const longTermCareRaw = (baseForLtc * detail.longTermCareRate) / 100
  const longTermCarePremium = Math.floor(Math.max(0, longTermCareRaw) / 10) * 10
  // ⑥ 건강보험료 = (①+③)−(④+⑤) → 원단위(10원) 내림 (예: 51039 → 51030)
  const healthPremiumRaw =
    detail.incomePremium + propertyPremium - detail.reduction - detail.temporaryReduction
  const healthPremium = Math.floor(Math.max(0, healthPremiumRaw) / 10) * 10
  const rawTotal =
    healthPremium - detail.healthExemption + longTermCarePremium - detail.longTermCareExemption
  // 최종 납부보험료: 10원 미만 절사
  const totalPayable = Math.floor(Math.max(0, rawTotal) / 10) * 10
  return {
    propertyPremium: Math.max(0, propertyPremium),
    healthPremium,
    longTermCarePremium: Math.max(0, longTermCarePremium),
    totalPayable,
  }
}

export function healthInsuranceGrandTotal(detail: HealthInsuranceDetail): number {
  return computeHealthInsurance(detail).totalPayable
}

export function isHealthInsuranceDetail(raw: unknown): raw is HealthInsuranceDetail {
  return Boolean(raw && typeof raw === 'object' && (raw as { kind?: string }).kind === 'regionalHealth')
}

export function parseHealthInsuranceDetail(raw: unknown): HealthInsuranceDetail | null {
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
  // 이전 섹션형 JSON은 무시하고 기본값으로 새로 시작할 수 있게 null 반환
  if (row.kind !== 'regionalHealth' && Array.isArray(row.sections)) return null

  return {
    kind: 'regionalHealth',
    incomePremium: nonNegRound(row.incomePremium),
    propertyPoints: nonNegNumber(row.propertyPoints),
    propertyPointUnit:
      row.propertyPointUnit != null && Number.isFinite(Number(row.propertyPointUnit))
        ? Math.max(0, Number(row.propertyPointUnit))
        : DEFAULT_PROPERTY_POINT_UNIT,
    reduction: nonNegRound(row.reduction),
    temporaryReduction: nonNegRound(row.temporaryReduction),
    healthExemption: nonNegRound(row.healthExemption),
    longTermCareRate: nonNegNumber(row.longTermCareRate),
    longTermCareExemption: nonNegRound(row.longTermCareExemption),
  }
}

export function healthInsuranceDetailForDb(detail: HealthInsuranceDetail | null | undefined): string | null {
  if (!detail) return null
  return JSON.stringify(detail)
}

export type HealthInsuranceBillRow = {
  no: string
  label: string
  valueLabel: string
  emphasize?: 'total' | 'subtotal' | 'highlight'
  /** 점수/원 값만 primary 색 */
  valueAccent?: boolean
}

/** 고지서와 같은 표 행 목록 */
export function buildHealthInsuranceBillRows(detail: HealthInsuranceDetail): HealthInsuranceBillRow[] {
  const c = computeHealthInsurance(detail)
  const unit = detail.propertyPointUnit
  const unitLabel = Number.isInteger(unit) ? String(unit) : String(unit)
  const rateLabel = Number.isInteger(detail.longTermCareRate)
    ? String(detail.longTermCareRate)
    : String(detail.longTermCareRate)

  return [
    {
      no: '계',
      label: '총 납부할 보험료 (⑥ - ⑦) + (⑧ - ⑨)',
      valueLabel: `${c.totalPayable.toLocaleString('ko-KR')} 원`,
      emphasize: 'total',
    },
    {
      no: '①',
      label: '소득월액보험료(사업·금융·연금·근로·기타소득) x 건강보험료율',
      valueLabel: `${detail.incomePremium.toLocaleString('ko-KR')} 원`,
    },
    {
      no: '②',
      label: '재산(주택·건물·토지·전월세 등) 점수',
      valueLabel: `${detail.propertyPoints.toLocaleString('ko-KR')} 점`,
      valueAccent: true,
    },
    {
      no: '③',
      label: `재산보험료(② x ${unitLabel})`,
      valueLabel: `${c.propertyPremium.toLocaleString('ko-KR')} 원`,
    },
    {
      no: '④',
      label: '경감·정지·제외',
      valueLabel: `${detail.reduction.toLocaleString('ko-KR')} 원`,
    },
    {
      no: '⑤',
      label: '한시적 감액(-)',
      valueLabel: `${detail.temporaryReduction.toLocaleString('ko-KR')} 원`,
    },
    {
      no: '⑥',
      label: '건강보험료 (① + ③) - (④ + ⑤), 원단위 내림',
      valueLabel: `${c.healthPremium.toLocaleString('ko-KR')} 원`,
      emphasize: 'subtotal',
    },
    {
      no: '⑦',
      label: '건강 면제·지원금',
      valueLabel: `${detail.healthExemption.toLocaleString('ko-KR')} 원`,
    },
    {
      no: '⑧',
      label: `장기요양보험료 ((①+(②×③)) × ${rateLabel}%, 원단위 내림)`,
      valueLabel: `${c.longTermCarePremium.toLocaleString('ko-KR')} 원`,
      emphasize: 'highlight',
    },
    {
      no: '⑨',
      label: '장기 면제·지원금',
      valueLabel: `${detail.longTermCareExemption.toLocaleString('ko-KR')} 원`,
    },
  ]
}
