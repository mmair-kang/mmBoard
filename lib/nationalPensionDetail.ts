// 수정: Auto — 2026-07-19 03:30 (국민연금 보험료 결정내역)

/** 국민연금 지역가입자 보험료 결정내역 입력값 */
export type NationalPensionDetail = {
  kind: 'nationalPension'
  /** 당월분 기준소득월액 */
  standardMonthlyIncome: number
  /** 당월분 보험료 */
  currentPremium: number
  /** 공제금액 */
  deduction: number
  /** 소급분 보험료 */
  retroactivePremium: number
  /** 당월 국고보조금 */
  currentSubsidy: number
  /** 소급분 국고보조금 */
  retroactiveSubsidy: number
}

export type NationalPensionComputed = {
  /** 최종징수 결정액(A) */
  finalAmount: number
}

export function defaultNationalPensionDetail(): NationalPensionDetail {
  return {
    kind: 'nationalPension',
    standardMonthlyIncome: 0,
    currentPremium: 0,
    deduction: 0,
    retroactivePremium: 0,
    currentSubsidy: 0,
    retroactiveSubsidy: 0,
  }
}

function nonNegRound(n: unknown): number {
  const v = Math.round(Number(n))
  if (!Number.isFinite(v) || v < 0) return 0
  return v
}

export function computeNationalPension(detail: NationalPensionDetail): NationalPensionComputed {
  // (당월분 보험료 + 소급분 보험료 − 공제금액) − (당월 국고보조금 + 소급분 국고보조금)
  const gross = detail.currentPremium + detail.retroactivePremium - detail.deduction
  const subsidy = detail.currentSubsidy + detail.retroactiveSubsidy
  const finalAmount = Math.max(0, gross - subsidy)
  return { finalAmount }
}

export function nationalPensionGrandTotal(detail: NationalPensionDetail): number {
  return computeNationalPension(detail).finalAmount
}

export function isNationalPensionDetail(raw: unknown): raw is NationalPensionDetail {
  return Boolean(raw && typeof raw === 'object' && (raw as { kind?: string }).kind === 'nationalPension')
}

export function parseNationalPensionDetail(raw: unknown): NationalPensionDetail | null {
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
  if (row.kind !== 'nationalPension' && Array.isArray(row.sections)) return null
  if (row.kind === 'regionalHealth') return null

  return {
    kind: 'nationalPension',
    standardMonthlyIncome: nonNegRound(row.standardMonthlyIncome),
    currentPremium: nonNegRound(row.currentPremium),
    deduction: nonNegRound(row.deduction),
    retroactivePremium: nonNegRound(row.retroactivePremium),
    currentSubsidy: nonNegRound(row.currentSubsidy),
    retroactiveSubsidy: nonNegRound(row.retroactiveSubsidy),
  }
}

export function nationalPensionDetailForDb(detail: NationalPensionDetail | null | undefined): string | null {
  if (!detail) return null
  return JSON.stringify(detail)
}

export type NationalPensionBillRow = {
  label: string
  valueLabel: string
  emphasize?: 'final'
}

/** 보험료결정 세부내역 표 행 */
export function buildNationalPensionBillRows(detail: NationalPensionDetail): NationalPensionBillRow[] {
  const { finalAmount } = computeNationalPension(detail)
  return [
    {
      label: '당월분 기준소득월액',
      valueLabel: `${detail.standardMonthlyIncome.toLocaleString('ko-KR')} 원`,
    },
    {
      label: '당월분 보험료',
      valueLabel: `${detail.currentPremium.toLocaleString('ko-KR')} 원`,
    },
    {
      label: '공제금액',
      valueLabel: `${detail.deduction.toLocaleString('ko-KR')} 원`,
    },
    {
      label: '소급분 보험료',
      valueLabel: `${detail.retroactivePremium.toLocaleString('ko-KR')} 원`,
    },
    {
      label: '최종징수 결정액(A)',
      valueLabel: `${finalAmount.toLocaleString('ko-KR')} 원`,
      emphasize: 'final',
    },
    {
      label: '당월 국고보조금',
      valueLabel: `${detail.currentSubsidy.toLocaleString('ko-KR')} 원`,
    },
    {
      label: '소급분 국고보조금',
      valueLabel: `${detail.retroactiveSubsidy.toLocaleString('ko-KR')} 원`,
    },
  ]
}
