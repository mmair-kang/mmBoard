// 수정: Auto — 2026-07-24 16:40 (종목명 충돌 병합·표시명 보정)
// 수정: Auto — 2026-07-24 16:21 (표시명=종목명, 시세=종목코드)
// 수정: Auto — 2026-07-24 15:40 (투자 배당타입 → 보유배당주 동기화)
import { eq } from 'drizzle-orm'

import { getDividendHoldingSeed } from '@/lib/dividendHoldingsConfig'
import { db } from '@/lib/db'
import { ensureDividendSchema } from '@/lib/dividendSchema'
import { ensureInvestmentSchema } from '@/lib/investmentSchema'
import { normalizeInvestmentSymbol } from '@/lib/stock'
import { dividendEntries, dividendHoldings, investmentHoldings } from '@/lib/schema'

type DividendMarket = 'overseas' | 'domestic'
type DividendRow = typeof dividendHoldings.$inferSelect

function toDividendMarket(market: string): DividendMarket | null {
  if (market === 'domestic' || market === 'overseas') return market
  return null
}

async function remapEntryTickers(fromTicker: string, toTicker: string) {
  if (!fromTicker || !toTicker || fromTicker === toTicker) return
  await db
    .update(dividendEntries)
    .set({ ticker: toTicker })
    .where(eq(dividendEntries.ticker, fromTicker))
}

/** 같은 표시명(ticker UNIQUE) 충돌 행을 제거하고, 비어 있던 배당값을 승계 */
async function absorbTickerConflicts(
  keepId: number,
  displayName: string,
  rows: DividendRow[],
): Promise<Partial<DividendRow>> {
  const key = displayName.trim().toUpperCase()
  const inherited: Partial<DividendRow> = {}

  for (const row of rows) {
    if (row.id === keepId) continue
    if (row.ticker.trim().toUpperCase() !== key) continue

    if (!(inherited.perShareDividendUsd) && row.perShareDividendUsd > 0) {
      inherited.perShareDividendUsd = row.perShareDividendUsd
    }
    if (!(inherited.perShareDividendKrw) && row.perShareDividendKrw > 0) {
      inherited.perShareDividendKrw = row.perShareDividendKrw
    }
    if (!(inherited.perShareTaxBaseKrw) && (row.perShareTaxBaseKrw ?? 0) > 0) {
      inherited.perShareTaxBaseKrw = row.perShareTaxBaseKrw
    }
    if (!(inherited.referencePriceUsd) && row.referencePriceUsd > 0) {
      inherited.referencePriceUsd = row.referencePriceUsd
    }
    if (!(inherited.referencePriceKrw) && row.referencePriceKrw > 0) {
      inherited.referencePriceKrw = row.referencePriceKrw
    }

    await remapEntryTickers(row.ticker, displayName)
    await db.delete(dividendHoldings).where(eq(dividendHoldings.id, row.id))
  }

  return inherited
}

/**
 * 투자 종목 중 타입이 배당인 항목을 보유 배당주에 맞춘다.
 * - 표시명(ticker): 투자 종목명
 * - 시세코드(quoteSymbol): 투자 종목코드
 * - 주식수는 투자 종목 shares를 그대로 반영
 */
export async function syncDividendHoldingsFromInvestments() {
  await ensureInvestmentSchema()
  await ensureDividendSchema()

  const investments = await db.select().from(investmentHoldings)
  let dividends = await db.select().from(dividendHoldings)

  const dividendByInvestmentId = new Map<number, DividendRow>()
  const dividendByTicker = new Map<string, DividendRow>()
  const dividendByQuote = new Map<string, DividendRow>()

  const reindex = (rows: DividendRow[]) => {
    dividendByInvestmentId.clear()
    dividendByTicker.clear()
    dividendByQuote.clear()
    for (const row of rows) {
      if (row.investmentHoldingId != null) {
        dividendByInvestmentId.set(row.investmentHoldingId, row)
      }
      dividendByTicker.set(row.ticker.toUpperCase(), row)
      const quote = (row.quoteSymbol || row.ticker).toUpperCase()
      dividendByQuote.set(quote, row)
    }
  }
  reindex(dividends)

  const keepDividendIds = new Set<number>()
  let sortOrder = 0
  let dividendInvestmentCount = 0

  for (const inv of investments) {
    const market = toDividendMarket(inv.market)
    if (inv.holdingType !== 'dividend' || market == null) continue
    dividendInvestmentCount += 1

    const symbol = normalizeInvestmentSymbol(inv.symbol).toUpperCase()
    const seed = getDividendHoldingSeed(symbol) ?? getDividendHoldingSeed(inv.name.trim())
    const rawName = inv.name.trim()
    // 종목명이 코드(498400)로만 들어가 있으면 시드/관용 표기(KODEX) 우선
    const displayName = (
      (/^\d+$/.test(rawName) && seed?.ticker ? seed.ticker : rawName) ||
      seed?.ticker ||
      symbol
    ).trim()
    const quoteSymbol = (seed?.quoteSymbol || symbol).toUpperCase()

    const existing =
      dividendByInvestmentId.get(inv.id) ??
      dividendByQuote.get(symbol) ??
      dividendByTicker.get(symbol) ??
      dividendByTicker.get(displayName.toUpperCase()) ??
      null

    if (existing) {
      keepDividendIds.add(existing.id)
      const prevTicker = existing.ticker
      const inherited = await absorbTickerConflicts(existing.id, displayName, dividends)

      await db
        .update(dividendHoldings)
        .set({
          ticker: displayName,
          market,
          quoteSymbol,
          defaultShares: inv.shares,
          investmentHoldingId: inv.id,
          sortOrder,
          ...(existing.perShareDividendUsd <= 0 && inherited.perShareDividendUsd
            ? { perShareDividendUsd: inherited.perShareDividendUsd }
            : {}),
          ...(existing.perShareDividendKrw <= 0 && inherited.perShareDividendKrw
            ? { perShareDividendKrw: inherited.perShareDividendKrw }
            : {}),
          ...((existing.perShareTaxBaseKrw ?? 0) <= 0 && inherited.perShareTaxBaseKrw
            ? { perShareTaxBaseKrw: inherited.perShareTaxBaseKrw }
            : {}),
          ...(existing.referencePriceUsd <= 0 && inherited.referencePriceUsd
            ? { referencePriceUsd: inherited.referencePriceUsd }
            : {}),
          ...(existing.referencePriceKrw <= 0 && inherited.referencePriceKrw
            ? { referencePriceKrw: inherited.referencePriceKrw }
            : {}),
        })
        .where(eq(dividendHoldings.id, existing.id))

      await remapEntryTickers(prevTicker, displayName)
      if (prevTicker.toUpperCase() !== symbol) {
        await remapEntryTickers(symbol, displayName)
      }
      // seed ticker alias (KODEX) also remap if different
      if (seed?.ticker && seed.ticker.toUpperCase() !== displayName.toUpperCase()) {
        await remapEntryTickers(seed.ticker, displayName)
      }

      dividends = await db.select().from(dividendHoldings)
      reindex(dividends)
    } else {
      await absorbTickerConflicts(-1, displayName, dividends)
      const inserted = await db
        .insert(dividendHoldings)
        .values({
          ticker: displayName,
          market,
          quoteSymbol,
          defaultShares: inv.shares,
          investmentHoldingId: inv.id,
          perShareDividendUsd: 0,
          perShareDividendKrw: 0,
          perShareTaxBaseKrw: 0,
          referencePriceUsd: 0,
          referencePriceKrw: 0,
          referenceExchangeRate: 0,
          sortOrder,
        })
        .returning()
      if (inserted[0]) {
        keepDividendIds.add(inserted[0].id)
        await remapEntryTickers(symbol, displayName)
        if (seed?.ticker) await remapEntryTickers(seed.ticker, displayName)
      }
      dividends = await db.select().from(dividendHoldings)
      reindex(dividends)
    }
    sortOrder += 1
  }

  dividends = await db.select().from(dividendHoldings)
  for (const row of dividends) {
    if (keepDividendIds.has(row.id)) continue
    if (row.investmentHoldingId != null || dividendInvestmentCount > 0) {
      await db.delete(dividendHoldings).where(eq(dividendHoldings.id, row.id))
    }
  }
}

/**
 * 기존 배당 보유(티커·시세코드)와 심볼이 같은 투자 종목을 배당 타입으로 승격
 */
export async function migrateInvestmentDividendTypesFromHoldings() {
  await ensureInvestmentSchema()
  await ensureDividendSchema()

  const dividends = await db.select().from(dividendHoldings)
  if (dividends.length === 0) return

  const investments = await db.select().from(investmentHoldings)
  const matchKeys = new Set<string>()
  for (const row of dividends) {
    matchKeys.add(row.ticker.toUpperCase())
    if (row.quoteSymbol) matchKeys.add(row.quoteSymbol.toUpperCase())
  }
  // 시드 시세코드도 매칭
  for (const seed of ['498400', 'KODEX', 'JEPQ', 'GPIX']) {
    matchKeys.add(seed)
  }

  for (const inv of investments) {
    const market = toDividendMarket(inv.market)
    if (market == null) continue
    const symbol = normalizeInvestmentSymbol(inv.symbol).toUpperCase()
    if (!matchKeys.has(symbol) && !matchKeys.has(inv.name.trim().toUpperCase())) continue
    if (inv.holdingType === 'dividend') continue
    await db
      .update(investmentHoldings)
      .set({ holdingType: 'dividend' })
      .where(eq(investmentHoldings.id, inv.id))
  }
}
