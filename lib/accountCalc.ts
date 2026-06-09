// 수정: Auto — 2026-06-08

export function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

export type OutflowLike = {
  amount: number
  switchOn: boolean
}

export function calcAccountProjectedBalance(balance: number, outflows: OutflowLike[]) {
  const pendingTotal = outflows
    .filter((row) => !row.switchOn)
    .reduce((sum, row) => sum + row.amount, 0)

  return {
    pendingTotal,
    projectedBalance: balance - pendingTotal,
  }
}
