// 수정: Auto — 2026-06-11 (재구매중 스위치)

/** 생활비 월 환산 기준 일수 */
export const LIVING_DAYS_PER_MONTH = 30

export type LivingCostItem = {
  purchasePrice: number
  repurchaseDays: number | null | undefined
  repurchaseActive?: boolean
}

export type LivingSubMonthlyRow = {
  subKey: string
  label: string
  monthly: number
}

export function calcLivingMonthlyCost(
  purchasePrice: number,
  repurchaseDays: number | null | undefined,
): number | null {
  if (repurchaseDays == null || repurchaseDays <= 0 || purchasePrice < 0) return null
  return Math.round((purchasePrice / repurchaseDays) * LIVING_DAYS_PER_MONTH)
}

export function isLivingCostCountable(item: LivingCostItem): boolean {
  return item.repurchaseActive === true
}

export function formatLivingMonthlyCost(cost: number | null): string | null {
  if (cost == null) return null
  return `${cost.toLocaleString('ko-KR')}원/월`
}

/** 칩·한줄 요약용 — 1.2만, 8천, 500 */
export function formatCompactLivingAmount(amount: number): string {
  if (amount >= 10000) {
    const rounded = Math.round((amount / 10000) * 10) / 10
    return `${rounded}만`
  }
  if (amount >= 1000) {
    const rounded = Math.round((amount / 1000) * 10) / 10
    return `${rounded}천`
  }
  return amount.toLocaleString('ko-KR')
}

export function sumLivingMonthlyCosts(items: LivingCostItem[]): number {
  return items.reduce((sum, item) => {
    if (!isLivingCostCountable(item)) return sum
    const monthly = calcLivingMonthlyCost(item.purchasePrice, item.repurchaseDays)
    return sum + (monthly ?? 0)
  }, 0)
}

export function buildLivingMonthlyBreakdown(
  items: (LivingCostItem & { subCategory: string })[],
  subs: { key: string; label: string }[],
): { rows: LivingSubMonthlyRow[]; total: number } {
  const totals = new Map<string, number>()
  for (const item of items) {
    if (!isLivingCostCountable(item)) continue
    const monthly = calcLivingMonthlyCost(item.purchasePrice, item.repurchaseDays)
    if (monthly == null) continue
    totals.set(item.subCategory, (totals.get(item.subCategory) ?? 0) + monthly)
  }

  const rows: LivingSubMonthlyRow[] = []
  const seen = new Set<string>()
  for (const sub of subs) {
    const monthly = totals.get(sub.key) ?? 0
    if (monthly > 0) {
      rows.push({ subKey: sub.key, label: sub.label, monthly })
      seen.add(sub.key)
    }
  }
  for (const [key, monthly] of totals) {
    if (monthly > 0 && !seen.has(key)) {
      rows.push({ subKey: key, label: key, monthly })
    }
  }

  return { rows, total: sumLivingMonthlyCosts(items) }
}
