// 수정: Auto — 2026-07-19 16:05 (결제방식)
// 수정: Auto — 2026-07-19 16:00 (네이버플러스 멤버십)
// 수정: Auto — 2026-07-19 15:10 (Cursor PRO 타입)
// 수정: Auto — 2026-07-19 14:40 (연납 타입)

export const ANNUAL_PAYMENT_TYPES = ['none', 'carInsurance', 'cursorPro', 'naverPlus'] as const
export type AnnualPaymentType = (typeof ANNUAL_PAYMENT_TYPES)[number]

export const ANNUAL_PAYMENT_DETAIL_TYPES = ['carInsurance', 'cursorPro', 'naverPlus'] as const
export type AnnualPaymentDetailType = (typeof ANNUAL_PAYMENT_DETAIL_TYPES)[number]

export const ANNUAL_PAYMENT_PAY_TYPES = ['card', 'cash'] as const
export type AnnualPaymentPayType = (typeof ANNUAL_PAYMENT_PAY_TYPES)[number]

export function isValidAnnualPaymentPayType(value: unknown): value is AnnualPaymentPayType {
  return (ANNUAL_PAYMENT_PAY_TYPES as readonly string[]).includes(String(value))
}

export function getAnnualPaymentPayTypeLabel(type: AnnualPaymentPayType): string {
  return type === 'cash' ? '현금' : '카드'
}

export function isValidAnnualPaymentType(value: unknown): value is AnnualPaymentType {
  return (ANNUAL_PAYMENT_TYPES as readonly string[]).includes(String(value))
}

export function hasAnnualPaymentDetailType(
  type: AnnualPaymentType,
): type is AnnualPaymentDetailType {
  return (ANNUAL_PAYMENT_DETAIL_TYPES as readonly string[]).includes(type)
}

export function getAnnualPaymentTypeLabel(type: AnnualPaymentType): string {
  switch (type) {
    case 'carInsurance':
      return '자동차보험'
    case 'cursorPro':
      return 'Cursor PRO'
    case 'naverPlus':
      return '네이버플러스 멤버십'
    default:
      return '없음'
  }
}
