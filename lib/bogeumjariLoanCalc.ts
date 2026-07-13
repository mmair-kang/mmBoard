// 수정: Auto — 2026-07-14 01:26

import dayjs from 'dayjs'

export const BOGEUMJARI_LOAN_START = '2020-01-03'
export const BOGEUMJARI_LOAN_MATURITY = '2050-01-03'
export const BOGEUMJARI_LOAN_PRODUCT = '아낌e보금자리론'
export const BOGEUMJARI_LOAN_REPAYMENT = '원리금균등상환'

export type BogeumjariLoanPaymentBreakdown = {
  monthlyPayment: number
  principalPart: number
  interestPart: number
}

export function formatLoanDateKo(iso: string): string {
  const date = dayjs(iso)
  return `${date.year()}년 ${date.month() + 1}월 ${date.date()}일`
}

/** 고정 월 상환액 기준 — 다음 회차 원금·이자 분해 */
export function calcBogeumjariLoanPaymentBreakdown(
  balance: number,
  annualRatePercent: number,
  monthlyPayment: number,
): BogeumjariLoanPaymentBreakdown | null {
  if (balance <= 0 || monthlyPayment <= 0) return null

  const monthlyRate = annualRatePercent / 100 / 12
  const interestPart = Math.round(balance * monthlyRate)
  const principalPart = Math.max(0, monthlyPayment - interestPart)

  return {
    monthlyPayment,
    principalPart,
    interestPart,
  }
}
