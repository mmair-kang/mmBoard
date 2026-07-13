// 수정: Auto — 2026-07-13 23:56

import { DEFAULT_BOGEUMJARI_LOAN_RATE, type AssetManualSettings } from '@/lib/assetCalc'

function parseNonNegativeAmount(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.max(0, Math.round(value))
}

function parseLoanRate(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.round(Math.min(100, Math.max(0, value)) * 100) / 100
}

function parsePaymentDay(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.min(31, Math.max(1, Math.round(value)))
}

export function parseAssetSettingsPayload(
  body: Record<string, unknown>,
): Partial<AssetManualSettings> | null {
  const result: Partial<AssetManualSettings> = {}

  if ('apartmentValue' in body) {
    const parsed = parseNonNegativeAmount(body.apartmentValue)
    if (parsed === null) return null
    result.apartmentValue = parsed
  }

  if ('bogeumjariLoan' in body) {
    const parsed = parseNonNegativeAmount(body.bogeumjariLoan)
    if (parsed === null) return null
    result.bogeumjariLoan = parsed
  }

  if ('bogeumjariLoanRate' in body) {
    const parsed = parseLoanRate(body.bogeumjariLoanRate)
    if (parsed === null) return null
    result.bogeumjariLoanRate = parsed
  }

  if ('bogeumjariMonthlyPayment' in body) {
    const parsed = parseNonNegativeAmount(body.bogeumjariMonthlyPayment)
    if (parsed === null) return null
    result.bogeumjariMonthlyPayment = parsed
  }

  if ('bogeumjariPaymentDay' in body) {
    const parsed = parsePaymentDay(body.bogeumjariPaymentDay)
    if (parsed === null) return null
    result.bogeumjariPaymentDay = parsed
  }

  if (Object.keys(result).length === 0) return null
  return result
}

export function formatLoanRate(value: number = DEFAULT_BOGEUMJARI_LOAN_RATE): string {
  return `${value.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`
}
