// 수정: Auto — 2026-06-08
import { asc, eq } from 'drizzle-orm'

import {
  calcDividendEntry,
  calcDividendMonthSummary,
  calcHoldingReference,
  calcYearFinancialIncome,
} from '@/lib/dividendCalc'
import { fetchStockQuoteMap } from '@/lib/stock'
import type { DividendEntryPayload, DividendHoldingPayload } from '@/lib/dividendPayload'
import { ensureDividendSchema } from '@/lib/dividendSchema'
import { db } from '@/lib/db'
import { dividendEntries, dividendHoldings, dividendMonths } from '@/lib/schema'
import dayjs from 'dayjs'

export type DividendHoldingRow = {
  id: number
  ticker: string
  defaultShares: number
  perShareDividendUsd: number
  referencePriceUsd: number
  referenceExchangeRate: number
  sortOrder: number
}

export type DividendHoldingView = DividendHoldingRow & {
  livePriceUsd: number | null
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

function toHoldingView(row: DividendHoldingRow, livePriceUsd?: number | null): DividendHoldingView {
  const livePrice = livePriceUsd != null && livePriceUsd > 0 ? livePriceUsd : null
  const calc = calcHoldingReference(row, livePrice)
  return {
    ...row,
    livePriceUsd: livePrice,
    grossMonthlyUsd: calc.grossMonthlyUsd,
    netMonthlyUsd: calc.netMonthlyUsd,
    grossKrw: calc.grossKrw,
    netKrw: calc.netKrw,
    yieldPercent: calc.yieldPercent,
  }
}

async function loadLivePriceMap(tickers: string[]): Promise<Map<string, number>> {
  const unique = [...new Set(tickers.map((t) => t.trim().toUpperCase()).filter(Boolean))]
  if (unique.length === 0) return new Map()
  try {
    return await fetchStockQuoteMap(unique)
  } catch (error) {
    console.warn('[dividend stock quotes]', error)
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
  const rows = await db
    .select()
    .from(dividendHoldings)
    .orderBy(asc(dividendHoldings.sortOrder), asc(dividendHoldings.id))
  const priceMap = await loadLivePriceMap(rows.map((row) => row.ticker))
  return rows.map((row) => toHoldingView(row, priceMap.get(row.ticker.toUpperCase()) ?? null))
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
  const existing = await loadDividendHoldings()
  const existingById = new Map(existing.map((row) => [row.id, row]))

  for (let i = 0; i < holdings.length; i++) {
    const holding = holdings[i]
    if (holding.id && existingById.has(holding.id)) {
      await db
        .update(dividendHoldings)
        .set({
          defaultShares: holding.defaultShares,
          perShareDividendUsd: holding.perShareDividendUsd,
          referencePriceUsd: holding.referencePriceUsd ?? 0,
          referenceExchangeRate: holding.referenceExchangeRate,
          sortOrder: i,
        })
        .where(eq(dividendHoldings.id, holding.id))
      continue
    }

    await db.insert(dividendHoldings).values({
      ticker: holding.ticker,
      defaultShares: holding.defaultShares,
      perShareDividendUsd: holding.perShareDividendUsd,
      referencePriceUsd: holding.referencePriceUsd ?? 0,
      referenceExchangeRate: holding.referenceExchangeRate,
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
