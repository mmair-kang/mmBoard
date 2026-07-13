// 수정: Auto — 2026-07-14 02:00
import { asc, eq } from 'drizzle-orm'

import {
  calcDividendEntry,
  calcDividendMonthSummary,
  calcHoldingReference,
  calcYearFinancialIncome,
  type DividendMarket,
} from '@/lib/dividendCalc'
import type { DividendEntryPayload, DividendHoldingPayload } from '@/lib/dividendPayload'
import { ensureDividendSchema } from '@/lib/dividendSchema'
import { db } from '@/lib/db'
import { dividendEntries, dividendHoldings, dividendMonths } from '@/lib/schema'
import { fetchInvestmentPriceMap, fetchStockQuoteMap, fetchUsdKrwRate } from '@/lib/stock'
import dayjs from 'dayjs'

export type DividendHoldingRow = {
  id: number
  ticker: string
  market: DividendMarket
  quoteSymbol: string
  defaultShares: number
  perShareDividendUsd: number
  perShareDividendKrw: number
  referencePriceUsd: number
  referencePriceKrw: number
  referenceExchangeRate: number
  sortOrder: number
}

export type DividendHoldingView = DividendHoldingRow & {
  livePriceUsd: number | null
  livePriceKrw: number | null
  grossMonthlyUsd: number
  netMonthlyUsd: number
  grossKrw: number | null
  netKrw: number | null
  yieldPercent: number | null
}

export type DividendEntryRow = {
  id: number
  monthId: number
  dayOfMonth: number
  ticker: string
  shares: number
  exchangeRate: number
  foreignSettlement: number
  foreignTax: number
  sortOrder: number
}

export type DividendEntryView = DividendEntryRow & {
  dividendKrw: number
  taxKrw: number
  grossKrw: number
  perShareForeign: number | null
  perShareGrossForeign: number | null
}

export type DividendMonthView = {
  id: number
  yearMonth: string
  createdAt: string
  entries: DividendEntryView[]
  summary: ReturnType<typeof calcDividendMonthSummary>
}

function normalizeHoldingRow(row: typeof dividendHoldings.$inferSelect): DividendHoldingRow {
  return {
    id: row.id,
    ticker: row.ticker,
    market: (row.market === 'domestic' ? 'domestic' : 'overseas') as DividendMarket,
    quoteSymbol: row.quoteSymbol || row.ticker,
    defaultShares: row.defaultShares,
    perShareDividendUsd: row.perShareDividendUsd,
    perShareDividendKrw: row.perShareDividendKrw,
    referencePriceUsd: row.referencePriceUsd,
    referencePriceKrw: row.referencePriceKrw,
    referenceExchangeRate: row.referenceExchangeRate,
    sortOrder: row.sortOrder,
  }
}

function toHoldingView(
  row: DividendHoldingRow,
  livePriceUsd?: number | null,
  livePriceKrw?: number | null,
  liveExchangeRate?: number | null,
): DividendHoldingView {
  const livePrice =
    row.market === 'overseas' && livePriceUsd != null && livePriceUsd > 0 ? livePriceUsd : null
  const liveKrw =
    row.market === 'domestic' && livePriceKrw != null && livePriceKrw > 0 ? livePriceKrw : null
  const exchangeRate =
    row.market === 'overseas' && liveExchangeRate != null && liveExchangeRate > 0
      ? liveExchangeRate
      : row.referenceExchangeRate
  const calc = calcHoldingReference(
    { ...row, referenceExchangeRate: exchangeRate },
    livePrice,
    liveKrw,
  )
  return {
    ...row,
    livePriceUsd: livePrice,
    livePriceKrw: liveKrw,
    grossMonthlyUsd: calc.grossMonthlyUsd,
    netMonthlyUsd: calc.netMonthlyUsd,
    grossKrw: calc.grossKrw,
    netKrw: calc.netKrw,
    yieldPercent: calc.yieldPercent,
  }
}

async function loadOverseasPriceMap(tickers: string[]): Promise<Map<string, number>> {
  const unique = [...new Set(tickers.map((t) => t.trim().toUpperCase()).filter(Boolean))]
  if (unique.length === 0) return new Map()
  try {
    return await fetchStockQuoteMap(unique)
  } catch (error) {
    console.warn('[dividend overseas quotes]', error)
    return new Map()
  }
}

async function loadDomesticPriceMap(
  rows: Array<{ ticker: string; quoteSymbol: string }>,
): Promise<Map<string, number>> {
  if (rows.length === 0) return new Map()
  try {
    const { priceMap } = await fetchInvestmentPriceMap(
      rows.map((row) => ({ symbol: row.quoteSymbol, market: 'domestic' as const })),
    )
    const byTicker = new Map<string, number>()
    for (const row of rows) {
      const price = priceMap.get(row.quoteSymbol.toUpperCase())
      if (price != null && price > 0) byTicker.set(row.ticker.toUpperCase(), price)
    }
    return byTicker
  } catch (error) {
    console.warn('[dividend domestic quotes]', error)
    return new Map()
  }
}

export type DividendData = {
  holdings: DividendHoldingView[]
  months: DividendMonthView[]
  yearFinancialIncome: number
  yearLabel: string
}

function toEntryView(row: DividendEntryRow): DividendEntryView {
  const calc = calcDividendEntry(row)
  return {
    ...row,
    dividendKrw: calc.dividendKrw,
    taxKrw: calc.taxKrw,
    grossKrw: calc.grossKrw,
    perShareForeign: calc.perShareForeign,
    perShareGrossForeign: calc.perShareGrossForeign,
  }
}

function toMonthView(month: { id: number; yearMonth: string; createdAt: string }, entries: DividendEntryRow[]): DividendMonthView {
  const entryViews = entries.map(toEntryView)
  const summary = calcDividendMonthSummary(entries)
  return {
    id: month.id,
    yearMonth: month.yearMonth,
    createdAt: month.createdAt,
    entries: entryViews,
    summary,
  }
}

export async function loadDividendHoldings(): Promise<DividendHoldingView[]> {
  await ensureDividendSchema()
  const rows = (await db
    .select()
    .from(dividendHoldings)
    .orderBy(asc(dividendHoldings.sortOrder), asc(dividendHoldings.id))).map(normalizeHoldingRow)

  const overseas = rows.filter((row) => row.market === 'overseas')
  const domestic = rows.filter((row) => row.market === 'domestic')

  const [priceUsdMap, priceKrwMap, liveExchangeRate] = await Promise.all([
    loadOverseasPriceMap(overseas.map((row) => row.quoteSymbol)),
    loadDomesticPriceMap(domestic),
    fetchUsdKrwRate().catch((error) => {
      console.warn('[dividend usd/krw]', error)
      return null as number | null
    }),
  ])

  return rows.map((row) =>
    toHoldingView(
      row,
      priceUsdMap.get(row.quoteSymbol.toUpperCase()) ?? priceUsdMap.get(row.ticker.toUpperCase()) ?? null,
      priceKrwMap.get(row.ticker.toUpperCase()) ?? null,
      liveExchangeRate,
    ),
  )
}

export async function loadDividendData(): Promise<DividendData> {
  await ensureDividendSchema()
  const holdings = await loadDividendHoldings()
  const months = await db.select().from(dividendMonths).orderBy(asc(dividendMonths.yearMonth))
  const allEntries = await db
    .select()
    .from(dividendEntries)
    .orderBy(asc(dividendEntries.sortOrder), asc(dividendEntries.id))

  const entriesByMonth = new Map<number, DividendEntryRow[]>()
  for (const entry of allEntries) {
    const list = entriesByMonth.get(entry.monthId) ?? []
    list.push(entry)
    entriesByMonth.set(entry.monthId, list)
  }

  const monthViews = months.map((month) => toMonthView(month, entriesByMonth.get(month.id) ?? []))
  const year = dayjs().format('YYYY')
  const yearFinancialIncome = calcYearFinancialIncome(
    monthViews.map((month) => ({ yearMonth: month.yearMonth, entries: month.entries })),
    year,
  )

  return {
    holdings,
    months: monthViews,
    yearFinancialIncome,
    yearLabel: `${year}년`,
  }
}

export async function syncDividendHoldings(holdings: DividendHoldingPayload[]) {
  await ensureDividendSchema()
  const existing = (await db
    .select()
    .from(dividendHoldings)
    .orderBy(asc(dividendHoldings.sortOrder), asc(dividendHoldings.id))).map(normalizeHoldingRow)
  const existingById = new Map(existing.map((row) => [row.id, row]))

  const liveExchangeRate = await fetchUsdKrwRate().catch((error) => {
    console.warn('[dividend holdings sync rate]', error)
    return null as number | null
  })
  const referenceExchangeRate =
    liveExchangeRate != null && liveExchangeRate > 0
      ? liveExchangeRate
      : existing[0]?.referenceExchangeRate ?? 0

  for (let i = 0; i < holdings.length; i++) {
    const holding = holdings[i]
    const existingRow = holding.id ? existingById.get(holding.id) : undefined
    const market = holding.market ?? existingRow?.market ?? 'overseas'

    if (holding.id && existingById.has(holding.id)) {
      await db
        .update(dividendHoldings)
        .set({
          defaultShares: holding.defaultShares,
          perShareDividendUsd: market === 'overseas' ? holding.perShareDividendUsd : 0,
          perShareDividendKrw: market === 'domestic' ? (holding.perShareDividendKrw ?? 0) : 0,
          referencePriceUsd: holding.referencePriceUsd ?? 0,
          referencePriceKrw: holding.referencePriceKrw ?? 0,
          referenceExchangeRate: market === 'overseas' ? referenceExchangeRate : 0,
          sortOrder: i,
        })
        .where(eq(dividendHoldings.id, holding.id))
      continue
    }

    await db.insert(dividendHoldings).values({
      ticker: holding.ticker,
      market,
      quoteSymbol: holding.quoteSymbol ?? holding.ticker,
      defaultShares: holding.defaultShares,
      perShareDividendUsd: market === 'overseas' ? holding.perShareDividendUsd : 0,
      perShareDividendKrw: market === 'domestic' ? (holding.perShareDividendKrw ?? 0) : 0,
      referencePriceUsd: holding.referencePriceUsd ?? 0,
      referencePriceKrw: holding.referencePriceKrw ?? 0,
      referenceExchangeRate: market === 'overseas' ? referenceExchangeRate : 0,
      sortOrder: i,
    })
  }
}

export async function syncDividendEntries(monthId: number, entries: DividendEntryPayload[]) {
  const existing = await db.select().from(dividendEntries).where(eq(dividendEntries.monthId, monthId))
  const existingIds = new Set(existing.map((row) => row.id))
  const keepIds = new Set<number>()

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (entry.id && existingIds.has(entry.id)) {
      keepIds.add(entry.id)
      await db
        .update(dividendEntries)
        .set({
          dayOfMonth: entry.dayOfMonth,
          ticker: entry.ticker,
          shares: entry.shares,
          exchangeRate: entry.exchangeRate,
          foreignSettlement: entry.foreignSettlement,
          foreignTax: entry.foreignTax,
          sortOrder: i,
        })
        .where(eq(dividendEntries.id, entry.id))
      continue
    }

    await db.insert(dividendEntries).values({
      monthId,
      dayOfMonth: entry.dayOfMonth,
      ticker: entry.ticker,
      shares: entry.shares,
      exchangeRate: entry.exchangeRate,
      foreignSettlement: entry.foreignSettlement,
      foreignTax: entry.foreignTax,
      sortOrder: i,
    })
  }

  for (const row of existing) {
    if (!keepIds.has(row.id)) {
      await db.delete(dividendEntries).where(eq(dividendEntries.id, row.id))
    }
  }
}

export async function createDividendMonth(yearMonth: string, entries: DividendEntryPayload[]) {
  await ensureDividendSchema()
  const dup = await db.select().from(dividendMonths).where(eq(dividendMonths.yearMonth, yearMonth)).limit(1)
  if (dup[0]) throw new Error('duplicate month')

  const now = new Date().toISOString()
  const inserted = await db.insert(dividendMonths).values({ yearMonth, createdAt: now }).returning()
  const month = inserted[0]
  if (!month) throw new Error('month insert failed')

  await syncDividendEntries(month.id, entries)
  return month.id
}

export async function updateDividendMonth(monthId: number, entries: DividendEntryPayload[]) {
  await syncDividendEntries(monthId, entries)
}

export async function deleteDividendMonth(monthId: number) {
  await db.delete(dividendEntries).where(eq(dividendEntries.monthId, monthId))
  await db.delete(dividendMonths).where(eq(dividendMonths.id, monthId))
}
