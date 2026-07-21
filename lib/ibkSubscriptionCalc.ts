// 수정: Auto — 2026-07-21 21:46 (IBK청약 해지예상 계산)
import dayjs, { type Dayjs } from 'dayjs'

/** 가입일 (고정) */
export const IBK_SUBSCRIPTION_JOIN_DATE = '2021-06-23'

/** 적용이율 (연) */
export const IBK_SUBSCRIPTION_ANNUAL_RATE = 0.031

/** 이자소득세 실효세율 (소득세 14% + 지방소득세 1.4%) */
export const IBK_SUBSCRIPTION_TAX_RATE = 0.154
export const IBK_SUBSCRIPTION_INCOME_TAX_RATE = 0.14

/**
 * 은행 앱 기준 스냅샷 (2026-07-21)
 * - 해지예상금액 6,376,320원 / 총세금 68,490원(15.4%) 기준으로 역산
 * - 이후 일자는 원금에 연 3.1% 단순일할로 이자를 가산
 */
const SNAPSHOT_DATE = '2026-07-21'
const SNAPSHOT_AMOUNT = 6_376_320
const SNAPSHOT_INTEREST = 444_740
const SNAPSHOT_PRINCIPAL = SNAPSHOT_AMOUNT - SNAPSHOT_INTEREST

export type IbkSubscriptionEstimate = {
  joinDate: string
  asOfDate: string
  estimatedAmount: number
  annualRatePercent: number
  interest: number
  incomeTax: number
  residenceTax: number
  totalTax: number
  taxRatePercent: number
}

function startOfDay(value: Dayjs | string | Date = dayjs()): Dayjs {
  return dayjs(value).startOf('day')
}

export function calcIbkSubscriptionEstimate(
  asOf: Dayjs | string | Date = dayjs(),
): IbkSubscriptionEstimate {
  const asOfDate = startOfDay(asOf)
  const snapshotDate = startOfDay(SNAPSHOT_DATE)
  const deltaDays = asOfDate.diff(snapshotDate, 'day')

  const interest = Math.max(
    0,
    Math.round(SNAPSHOT_INTEREST + (SNAPSHOT_PRINCIPAL * IBK_SUBSCRIPTION_ANNUAL_RATE * deltaDays) / 365),
  )
  const estimatedAmount = SNAPSHOT_PRINCIPAL + interest
  const totalTax = Math.round(interest * IBK_SUBSCRIPTION_TAX_RATE)
  const incomeTax = Math.round(interest * IBK_SUBSCRIPTION_INCOME_TAX_RATE)
  const residenceTax = Math.max(0, totalTax - incomeTax)

  return {
    joinDate: IBK_SUBSCRIPTION_JOIN_DATE,
    asOfDate: asOfDate.format('YYYY-MM-DD'),
    estimatedAmount,
    annualRatePercent: IBK_SUBSCRIPTION_ANNUAL_RATE * 100,
    interest,
    incomeTax,
    residenceTax,
    totalTax,
    taxRatePercent: IBK_SUBSCRIPTION_TAX_RATE * 100,
  }
}

export function formatIbkWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}
