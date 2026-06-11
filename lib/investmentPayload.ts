// 수정: Auto — 2026-06-08

import {
  defaultMarketForAccount,
  isInvestmentAccountId,
  type InvestmentAccountId,
  type InvestmentMarket,
} from '@/config/investmentAccounts'
import { normalizeInvestmentSymbol } from '@/lib/stock'

const MARKET_SET = new Set<string>(['domestic', 'overseas', 'fund'])

export type InvestmentHoldingPayload = {
  category: InvestmentAccountId
  name: string
  symbol: string
  market: InvestmentMarket
  purchasePrice: number
  shares: number
}

export type InvestmentCashPayload = {
  category: InvestmentAccountId
  cashBalance: number
}

export type InvestmentHoldingSyncItem = {
  id?: number
  name: string
  symbol: string
  purchasePrice: number
  shares: number
}

export type InvestmentAccountSyncPayload = {
  category: InvestmentAccountId
  cashBalance: number
  holdings: InvestmentHoldingSyncItem[]
}

export function parseInvestmentHoldingPayload(body: Record<string, unknown>): InvestmentHoldingPayload | null {
  const category = String(body.category ?? '')
  if (!isInvestmentAccountId(category)) return null

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const symbol = typeof body.symbol === 'string' ? normalizeInvestmentSymbol(body.symbol) : ''
  if (!name || !symbol) return null

  const marketRaw = body.market != null ? String(body.market) : defaultMarketForAccount(category)
  if (!MARKET_SET.has(marketRaw)) return null

  const purchasePrice = Math.round(Number(body.purchasePrice))
  const shares = Math.round(Number(body.shares))
  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) return null
  if (!Number.isFinite(shares) || shares < 1) return null

  return {
    category,
    name,
    symbol,
    market: marketRaw as InvestmentMarket,
    purchasePrice,
    shares,
  }
}

export function parseInvestmentCashPayload(body: Record<string, unknown>): InvestmentCashPayload | null {
  const category = String(body.category ?? '')
  if (!isInvestmentAccountId(category)) return null

  const cashBalance = Math.round(Number(body.cashBalance))
  if (!Number.isFinite(cashBalance) || cashBalance < 0) return null

  return { category, cashBalance }
}

export function parseInvestmentAccountSyncPayload(
  body: Record<string, unknown>,
): InvestmentAccountSyncPayload | null {
  const category = String(body.category ?? '')
  if (!isInvestmentAccountId(category)) return null

  const cashBalance = Math.round(Number(body.cashBalance))
  if (!Number.isFinite(cashBalance) || cashBalance < 0) return null

  if (!Array.isArray(body.holdings)) return null

  const holdings: InvestmentHoldingSyncItem[] = []
  for (const raw of body.holdings) {
    if (!raw || typeof raw !== 'object') return null
    const row = raw as Record<string, unknown>
    const name = typeof row.name === 'string' ? row.name.trim() : ''
    const symbol = typeof row.symbol === 'string' ? normalizeInvestmentSymbol(row.symbol) : ''
    if (!name || !symbol) return null

    const purchasePrice = Math.round(Number(row.purchasePrice))
    const shares = Math.round(Number(row.shares))
    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) return null
    if (!Number.isFinite(shares) || shares < 1) return null

    const idRaw = row.id
    const id = idRaw != null ? Math.round(Number(idRaw)) : undefined
    holdings.push({
      id: id != null && Number.isFinite(id) && id > 0 ? id : undefined,
      name,
      symbol,
      purchasePrice,
      shares,
    })
  }

  return { category, cashBalance, holdings }
}
