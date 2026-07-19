// 수정: Auto — 2026-07-19 14:25 (소장 만 단위 반올림)
// 수정: Auto — 2026-07-19 13:45 (소장 구매가 합계)
// 수정: Auto — 2026-07-19 00:15 (선택 변형만 상시비)

/** 생활비 월 환산 기준 일수 */
export const LIVING_DAYS_PER_MONTH = 30

export type LivingCostItem = {
  purchasePrice: number
  repurchaseDays: number | null | undefined
  /** @deprecated food 항목은 hidden으로 대체 — DTO에서 !hidden으로 유지 */
  repurchaseActive?: boolean
  hidden?: boolean
  /** food 변형 — 미선택이면 상시비 제외 */
  isSelected?: boolean
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
  if (item.hidden === true) return false
  if (item.isSelected === false) return false
  return item.repurchaseActive !== false
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

/** 소장 합계용 — 만 단위만, 소수점 반올림 (예: 12.4만 → 12만) */
export function formatCompactOwnAmount(amount: number): string {
  return `${Math.round(amount / 10000)}만`
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

export type OwnSubPurchaseRow = {
  subKey: string
  label: string
  total: number
}

/** 소장 — 카테고리별 구매가 합계 (숨김 제외) */
export function buildOwnPurchaseBreakdown(
  items: { mainCategory: string; subCategory: string; purchasePrice: number; hidden?: boolean }[],
  main: string,
  subs: readonly { key: string; label: string }[],
): { rows: OwnSubPurchaseRow[]; total: number } {
  const totals = new Map<string, number>()
  let grand = 0
  for (const item of items) {
    if (item.mainCategory !== main) continue
    if (item.hidden === true) continue
    const price = Math.round(Number(item.purchasePrice))
    if (!Number.isFinite(price) || price <= 0) continue
    totals.set(item.subCategory, (totals.get(item.subCategory) ?? 0) + price)
    grand += price
  }

  const rows: OwnSubPurchaseRow[] = []
  const seen = new Set<string>()
  for (const sub of subs) {
    const total = totals.get(sub.key) ?? 0
    rows.push({ subKey: sub.key, label: sub.label, total })
    seen.add(sub.key)
  }
  for (const [key, total] of totals) {
    if (total > 0 && !seen.has(key)) {
      rows.push({ subKey: key, label: key, total })
    }
  }

  return { rows, total: grand }
}
