// 수정: Auto — 2026-07-24 15:40 (종목 타입·배당 연동)
// 수정: Auto — 2026-07-15 01:34 (연금 칩 제거)
// 수정: Auto — 2026-07-14 01:37 (예수금 수정 시각)

import {
  defaultMarketForAccount,
  INVESTMENT_ACCOUNT_IDS,
  INVESTMENT_ACCOUNTS,
  type InvestmentAccountId,
  type InvestmentMarket,
} from '@/config/investmentAccounts'
import { asc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import {
  migrateInvestmentDividendTypesFromHoldings,
  syncDividendHoldingsFromInvestments,
} from '@/lib/dividendInvestmentSync'
import {
  calcInvestmentAccountSummary,
  calcInvestmentHoldingView,
  type InvestmentAccountSummary,
  type InvestmentHoldingRow,
  type InvestmentHoldingView,
} from '@/lib/investmentCalc'
import type {
  InvestmentAccountSyncPayload,
  InvestmentCashPayload,
  InvestmentHoldingPayload,
  InvestmentHoldingType,
} from '@/lib/investmentPayload'
import { ensureInvestmentSchema } from '@/lib/investmentSchema'
import { fetchInvestmentPriceMap, normalizeInvestmentSymbol } from '@/lib/stock'
import { investmentAccountCash, investmentHoldings } from '@/lib/schema'

export type InvestmentAccountView = {
  id: InvestmentAccountId
  label: string
  title: string
  subtitle: string
  cashLabel: string
  cashBalanceKrw: number
  cashBalanceUpdatedAt: string | null
  holdings: InvestmentHoldingView[]
  summary: InvestmentAccountSummary
}

export type InvestmentData = {
  accounts: InvestmentAccountView[]
  usdKrwRate: number | null
  grandSummary: InvestmentAccountSummary
}

function normalizeHoldingType(value: string | null | undefined): InvestmentHoldingType {
  return value === 'dividend' ? 'dividend' : 'general'
}

function toHoldingRow(row: typeof investmentHoldings.$inferSelect): InvestmentHoldingRow {
  return {
    id: row.id,
    category: row.category as InvestmentAccountId,
    name: row.name,
    symbol: row.symbol,
    market: row.market,
    holdingType: normalizeHoldingType(row.holdingType),
    purchasePrice: row.purchasePrice,
    shares: row.shares,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  }
}

type CashRow = {
  balance: number
  updatedAt: string | null
}

async function loadCashMap(): Promise<Map<InvestmentAccountId, CashRow>> {
  const rows = await db.select().from(investmentAccountCash)
  const map = new Map<InvestmentAccountId, CashRow>()
  for (const id of INVESTMENT_ACCOUNT_IDS) map.set(id, { balance: 0, updatedAt: null })
  for (const row of rows) {
    if (INVESTMENT_ACCOUNT_IDS.includes(row.category as InvestmentAccountId)) {
      map.set(row.category as InvestmentAccountId, {
        balance: row.cashBalance,
        updatedAt: row.cashBalanceUpdatedAt ?? null,
      })
    }
  }
  return map
}

let dividendTypeMigrated = false

async function ensureDividendLinkMigration() {
  if (dividendTypeMigrated) return
  await migrateInvestmentDividendTypesFromHoldings()
  await syncDividendHoldingsFromInvestments()
  dividendTypeMigrated = true
}

export async function loadInvestmentData(): Promise<InvestmentData> {
  await ensureInvestmentSchema()
  await ensureDividendLinkMigration()

  const [holdingRows, cashMap] = await Promise.all([
    db
      .select()
      .from(investmentHoldings)
      .orderBy(asc(investmentHoldings.category), asc(investmentHoldings.sortOrder), asc(investmentHoldings.id)),
    loadCashMap(),
  ])

  const holdings = holdingRows.map(toHoldingRow)
  const { priceMap, usdKrwRate } = await fetchInvestmentPriceMap(
    holdings.map((row) => ({ symbol: row.symbol, market: row.market as InvestmentMarket })),
  ).catch((error) => {
    console.warn('[investment quotes]', error)
    return { priceMap: new Map<string, number>(), usdKrwRate: null as number | null }
  })

  const holdingsByAccount = new Map<InvestmentAccountId, InvestmentHoldingView[]>()
  for (const id of INVESTMENT_ACCOUNT_IDS) holdingsByAccount.set(id, [])

  for (const row of holdings) {
    const livePriceKrw = priceMap.get(normalizeInvestmentSymbol(row.symbol)) ?? null
    const view = calcInvestmentHoldingView(row, livePriceKrw)
    holdingsByAccount.get(row.category)?.push(view)
  }

  const accounts: InvestmentAccountView[] = INVESTMENT_ACCOUNTS.map((meta) => {
    const accountHoldings = holdingsByAccount.get(meta.id) ?? []
    const cash = cashMap.get(meta.id) ?? { balance: 0, updatedAt: null }
    const cashBalanceKrw = cash.balance
    return {
      id: meta.id,
      label: meta.label,
      title: meta.title,
      subtitle: meta.subtitle,
      cashLabel: meta.cashLabel,
      cashBalanceKrw,
      cashBalanceUpdatedAt: cash.updatedAt,
      holdings: accountHoldings,
      summary: calcInvestmentAccountSummary(accountHoldings, cashBalanceKrw),
    }
  })

  const grandHoldings = accounts.flatMap((account) => account.holdings)
  const grandCash = accounts.reduce((sum, account) => sum + account.cashBalanceKrw, 0)
  const grandSummary = calcInvestmentAccountSummary(grandHoldings, grandCash)

  return { accounts, usdKrwRate, grandSummary }
}

export async function createInvestmentHolding(payload: InvestmentHoldingPayload): Promise<InvestmentHoldingRow> {
  await ensureInvestmentSchema()
  const existing = await db
    .select({ sortOrder: investmentHoldings.sortOrder })
    .from(investmentHoldings)
    .where(eq(investmentHoldings.category, payload.category))
  const nextSort = existing.length > 0 ? Math.max(...existing.map((row) => row.sortOrder)) + 1 : 0

  const inserted = await db
    .insert(investmentHoldings)
    .values({
      category: payload.category,
      name: payload.name,
      symbol: payload.symbol,
      market: payload.market,
      holdingType: payload.holdingType,
      purchasePrice: payload.purchasePrice,
      shares: payload.shares,
      sortOrder: nextSort,
      createdAt: new Date().toISOString(),
    })
    .returning()

  const row = inserted[0]
  if (!row) throw new Error('insert failed')
  await syncDividendHoldingsFromInvestments()
  return toHoldingRow(row)
}

export async function updateInvestmentHolding(
  id: number,
  payload: InvestmentHoldingPayload,
): Promise<InvestmentHoldingRow | null> {
  await ensureInvestmentSchema()
  const updated = await db
    .update(investmentHoldings)
    .set({
      category: payload.category,
      name: payload.name,
      symbol: payload.symbol,
      market: payload.market,
      holdingType: payload.holdingType,
      purchasePrice: payload.purchasePrice,
      shares: payload.shares,
    })
    .where(eq(investmentHoldings.id, id))
    .returning()

  const row = updated[0]
  await syncDividendHoldingsFromInvestments()
  return row ? toHoldingRow(row) : null
}

export async function deleteInvestmentHolding(id: number) {
  await ensureInvestmentSchema()
  await db.delete(investmentHoldings).where(eq(investmentHoldings.id, id))
  await syncDividendHoldingsFromInvestments()
}

export async function updateInvestmentCash(payload: InvestmentCashPayload) {
  await ensureInvestmentSchema()
  const now = new Date().toISOString()
  await db
    .update(investmentAccountCash)
    .set({ cashBalance: payload.cashBalance, cashBalanceUpdatedAt: now })
    .where(eq(investmentAccountCash.category, payload.category))
}

export async function syncInvestmentAccount(payload: InvestmentAccountSyncPayload) {
  await ensureInvestmentSchema()
  const market = defaultMarketForAccount(payload.category)

  await updateInvestmentCash({ category: payload.category, cashBalance: payload.cashBalance })

  const existing = await db
    .select()
    .from(investmentHoldings)
    .where(eq(investmentHoldings.category, payload.category))
  const existingIds = new Set(existing.map((row) => row.id))
  const keepIds = new Set<number>()

  for (let i = 0; i < payload.holdings.length; i++) {
    const holding = payload.holdings[i]
    if (holding.id != null && existingIds.has(holding.id)) {
      keepIds.add(holding.id)
      await db
        .update(investmentHoldings)
        .set({
          name: holding.name,
          symbol: holding.symbol,
          market,
          holdingType: holding.holdingType,
          purchasePrice: holding.purchasePrice,
          shares: holding.shares,
          sortOrder: i,
        })
        .where(eq(investmentHoldings.id, holding.id))
      continue
    }

    await db.insert(investmentHoldings).values({
      category: payload.category,
      name: holding.name,
      symbol: holding.symbol,
      market,
      holdingType: holding.holdingType,
      purchasePrice: holding.purchasePrice,
      shares: holding.shares,
      sortOrder: i,
      createdAt: new Date().toISOString(),
    })
  }

  for (const row of existing) {
    if (!keepIds.has(row.id)) {
      await db.delete(investmentHoldings).where(eq(investmentHoldings.id, row.id))
    }
  }

  await syncDividendHoldingsFromInvestments()
}
