// 수정: Auto — 2026-07-23 13:40 (은행 실측 재보정)
// 수정: Auto — 2026-07-21 21:46 (IBK청약 해지예상 계산)
import dayjs, { type Dayjs } from 'dayjs'

/** 가입일 (고정) */
export const IBK_SUBSCRIPTION_JOIN_DATE = '2021-06-23'

/** 적용이율 (연) — 안내 표시용. 일일 가산은 아래 실측 보정값을 사용 */
export const IBK_SUBSCRIPTION_ANNUAL_RATE = 0.031

/** 이자소득세 실효세율 (소득세 14% + 지방소득세 1.4%) */
export const IBK_SUBSCRIPTION_TAX_RATE = 0.154
export const IBK_SUBSCRIPTION_INCOME_TAX_RATE = 0.14

/**
 * 은행 앱 실측 스냅샷 (2026-07-23)
 *
 * 왜 예전 계산(6,377,328)이 틀렸나
 * - 기존: 2026-07-21 스냅샷 금액 6,376,320 + (원금×3.1%÷365 ≈ 504원/일)×2일
 * - 실제 은행: 07-21 해지예상 6,376,630 → 07-23 6,377,180 (+550원 / 2일 ≈ 275원/일)
 * - 차이 원인
 *   1) 07-21 기준 금액이 은행보다 310원 낮게 잡혀 있었음 (6,376,320 vs 6,376,630)
 *   2) 원금 전체에 연 3.1% 단순일할을 더하면 일 ~504원인데, 은행 해지예상 증가분은 일 ~275원
 *      (은행 표시 로직/반올림이 단순 일할과 다름)
 *
 * 조정
 * - 스냅샷을 07-23 은행 해지예상 6,377,180으로 재고정
 * - 이후 일자는 실측 일일 증가분 275원으로 가산 (이자·세금도 동일 증가분 반영)
 */
const SNAPSHOT_DATE = '2026-07-23'
const SNAPSHOT_AMOUNT = 6_377_180
/** 07-21 세금 역산 이자 444,740 + 실측 증가 550 */
const SNAPSHOT_INTEREST = 445_290
/** 은행 앱 07-21→07-23 실측 (+550원/2일) */
const CALIBRATED_DAILY_GROWTH = 275

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
  const accrued = CALIBRATED_DAILY_GROWTH * deltaDays

  const interest = Math.max(0, SNAPSHOT_INTEREST + accrued)
  const estimatedAmount = SNAPSHOT_AMOUNT + accrued
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
