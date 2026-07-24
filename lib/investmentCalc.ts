// 수정: Auto — 2026-07-24 15:40 (종목 타입)
// 수정: Auto — 2026-06-08

import type { InvestmentAccountId } from '@/config/investmentAccounts'
import type { InvestmentHoldingType } from '@/lib/investmentPayload'

export type InvestmentHoldingRow = {
  id: number
  category: InvestmentAccountId
  name: string
  symbol: string
  market: string
  holdingType: InvestmentHoldingType
  purchasePrice: number
  shares: number
  sortOrder: number
  createdAt: string
}

export type InvestmentHoldingView = InvestmentHoldingRow & {
  livePriceKrw: number | null
  purchaseAmountKrw: number
  currentAmountKrw: number | null
  returnRate: number | null
  profitLossKrw: number | null
}

export type InvestmentAccountSummary = {
  purchaseAmountKrw: number
  currentAmountKrw: number
  cashBalanceKrw: number
  totalPurchaseKrw: number
  totalCurrentKrw: number
  returnRate: number | null
  profitLossKrw: number
}

export function calcInvestmentHoldingView(
  row: InvestmentHoldingRow,
  livePriceKrw: number | null,
): InvestmentHoldingView {
  const purchaseAmountKrw = row.purchasePrice * row.shares
  const currentAmountKrw = livePriceKrw != null ? Math.round(livePriceKrw * row.shares) : null
  const profitLossKrw =
    currentAmountKrw != null ? currentAmountKrw - purchaseAmountKrw : null
  const returnRate =
    profitLossKrw != null && purchaseAmountKrw > 0
      ? Math.round((profitLossKrw / purchaseAmountKrw) * 10000) / 100
      : null

  return {
    ...row,
    livePriceKrw,
    purchaseAmountKrw,
    currentAmountKrw,
    returnRate,
    profitLossKrw,
  }
}

export function calcInvestmentAccountSummary(
  holdings: InvestmentHoldingView[],
  cashBalanceKrw: number,
): InvestmentAccountSummary {
  let purchaseAmountKrw = 0
  let currentAmountKrw = 0
  let hasCurrent = true

  for (const row of holdings) {
    purchaseAmountKrw += row.purchaseAmountKrw
    if (row.currentAmountKrw == null) {
      hasCurrent = false
      continue
    }
    currentAmountKrw += row.currentAmountKrw
  }

  const totalPurchaseKrw = purchaseAmountKrw + cashBalanceKrw
  const totalCurrentKrw = (hasCurrent ? currentAmountKrw : 0) + cashBalanceKrw
  const profitLossKrw = hasCurrent ? totalCurrentKrw - totalPurchaseKrw : 0
  const returnRate =
    hasCurrent && totalPurchaseKrw > 0
      ? Math.round((profitLossKrw / totalPurchaseKrw) * 10000) / 100
      : null

  return {
    purchaseAmountKrw,
    currentAmountKrw: hasCurrent ? currentAmountKrw : 0,
    cashBalanceKrw,
    totalPurchaseKrw,
    totalCurrentKrw: hasCurrent ? totalCurrentKrw : totalPurchaseKrw,
    returnRate: hasCurrent ? returnRate : null,
    profitLossKrw: hasCurrent ? profitLossKrw : 0,
  }
}

export function formatReturnRate(value: number | null): string {
  if (value == null) return '—'
  const rounded = Math.round(value * 100) / 100
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

export function returnTone(value: number | null): 'up' | 'down' | 'flat' {
  if (value == null || value === 0) return 'flat'
  return value > 0 ? 'up' : 'down'
}
