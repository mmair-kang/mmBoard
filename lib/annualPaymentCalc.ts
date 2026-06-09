// 수정: Auto — 2026-06-08

export function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

export type AnnualPaymentLike = {
  amount: number
  switchOn: boolean
}

export function calcAnnualPaymentSummary(payments: AnnualPaymentLike[]) {
  const totalAmount = payments.reduce((sum, row) => sum + row.amount, 0)
  const remainingAmount = payments
    .filter((row) => !row.switchOn)
    .reduce((sum, row) => sum + row.amount, 0)
  const paidAmount = totalAmount - remainingAmount

  return { totalAmount, remainingAmount, paidAmount }
}
