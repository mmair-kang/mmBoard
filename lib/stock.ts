// 수정: Auto — 2026-06-08

import type { InvestmentMarket } from '@/config/investmentAccounts'

/**
 * 시세 조회 기본 종목 — 다른 ETF/주식으로 바꿀 때 이 배열만 수정하면 됩니다.
 * 배당 API는 DB 보유 종목 ticker도 함께 조회합니다.
 */
export const STOCK_QUOTE_TICKERS = ['JEPQ', 'GPIX'] as const

export type StockQuoteTicker = (typeof STOCK_QUOTE_TICKERS)[number]

export type StockQuote = {
  symbol: string
  /** 시장 통화 기준 가격 */
  price: number
  /** 배당 등 USD 종목 호환 필드 (= price when currency is USD) */
  priceUsd: number
  currency: string
  marketState: string | null
  updatedAt: string
}

const USD_KRW_SYMBOL = 'KRW=X'

type YahooSparkMeta = {
  symbol?: string
  regularMarketPrice?: number
  currency?: string
  regularMarketTime?: number
  marketState?: string
}

type YahooSparkResponse = {
  spark?: {
    result?: Array<{
      symbol?: string
      response?: Array<{ meta?: YahooSparkMeta }>
    }>
  }
}

type YahooChartResponse = {
  chart?: {
    result?: Array<{ meta?: YahooSparkMeta }>
  }
}

const YAHOO_SPARK_URL = 'https://query1.finance.yahoo.com/v7/finance/spark'
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'
const QUOTE_CACHE_MS = 60_000

const YAHOO_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json',
} as const

let quoteCache: { key: string; at: number; quotes: StockQuote[] } | null = null
let usdKrwCache: { at: number; rate: number } | null = null

function normalizeSymbols(symbols: string[]): string[] {
  return [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))]
}

function metaToQuote(meta: YahooSparkMeta | undefined, fallbackSymbol?: string): StockQuote | null {
  const symbol = (meta?.symbol ?? fallbackSymbol)?.trim().toUpperCase()
  const price = meta?.regularMarketPrice
  const currency = meta?.currency ?? 'USD'
  if (!symbol || price == null || !Number.isFinite(price) || price <= 0) return null

  return {
    symbol,
    price,
    priceUsd: currency === 'USD' ? price : 0,
    currency,
    marketState: meta?.marketState ?? null,
    updatedAt: meta?.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
  }
}

export function stripYahooSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\.(KS|KQ)$/i, '')
}

/** Google Sheets KRX:0080X0 · 0080X0.KS → 0080X0 */
export function normalizeInvestmentSymbol(symbol: string): string {
  let code = symbol.trim().toUpperCase().replace(/\s/g, '')
  if (code.startsWith('KRX:')) code = code.slice(4)
  if (code.startsWith('KOSDAQ:')) code = code.slice(8)
  return code.replace(/\.(KS|KQ)$/i, '')
}

/** 국내/KRX 6자리 종목코드 (035720, 0080X0 등) */
export function isKrxListingCode(code: string): boolean {
  return /^[0-9A-Z]{6}$/.test(code)
}

/** 종목코드 → Yahoo Finance 심볼 */
export function resolveYahooSymbol(symbol: string, market: InvestmentMarket): string {
  const code = normalizeInvestmentSymbol(symbol)
  if (market === 'overseas') return code
  if (/\.(KS|KQ)$/i.test(symbol.trim())) return symbol.trim().toUpperCase()
  if (isKrxListingCode(code)) return `${code}.KS`
  return code
}

export function quotePriceToKrw(quote: StockQuote, usdKrwRate: number): number {
  if (quote.currency === 'KRW') return Math.round(quote.price)
  if (quote.currency === 'USD') return Math.round(quote.price * usdKrwRate)
  return Math.round(quote.price * usdKrwRate)
}

function parseSparkQuotes(payload: YahooSparkResponse): StockQuote[] {
  const quotes: StockQuote[] = []
  for (const row of payload.spark?.result ?? []) {
    const quote = metaToQuote(row.response?.[0]?.meta, row.symbol)
    if (quote) quotes.push(quote)
  }
  return quotes
}

function parseChartQuote(payload: YahooChartResponse, symbol: string): StockQuote | null {
  return metaToQuote(payload.chart?.result?.[0]?.meta, symbol)
}

async function fetchSparkQuotes(symbols: string[]): Promise<StockQuote[]> {
  const cacheKey = symbols.join(',')
  const url = `${YAHOO_SPARK_URL}?symbols=${encodeURIComponent(cacheKey)}&range=1d&interval=1d`
  const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Yahoo spark failed (${res.status})`)
  const payload = (await res.json()) as YahooSparkResponse
  return parseSparkQuotes(payload)
}

async function fetchChartQuote(symbol: string): Promise<StockQuote | null> {
  const url = `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?interval=1d&range=1d`
  const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 60 } })
  if (!res.ok) return null
  const payload = (await res.json()) as YahooChartResponse
  return parseChartQuote(payload, symbol)
}

async function fetchQuotesWithFallback(symbols: string[]): Promise<StockQuote[]> {
  const sparkQuotes = await fetchSparkQuotes(symbols)
  const found = new Set(sparkQuotes.map((row) => row.symbol))
  const missing = symbols.filter((symbol) => !found.has(symbol))
  if (missing.length === 0) return sparkQuotes

  const fallback = await Promise.all(missing.map((symbol) => fetchChartQuote(symbol)))
  return [...sparkQuotes, ...fallback.filter((row): row is StockQuote => row != null)]
}

export async function fetchStockQuotes(symbols?: string[]): Promise<StockQuote[]> {
  const normalized = normalizeSymbols(symbols?.length ? symbols : [...STOCK_QUOTE_TICKERS])
  if (normalized.length === 0) return []

  const cacheKey = normalized.join(',')
  const now = Date.now()
  if (quoteCache && quoteCache.key === cacheKey && now - quoteCache.at < QUOTE_CACHE_MS) {
    return quoteCache.quotes
  }

  const quotes = await fetchQuotesWithFallback(normalized)
  if (quotes.length === 0) {
    throw new Error('Yahoo Finance returned no quotes')
  }

  quoteCache = { key: cacheKey, at: now, quotes }
  return quotes
}

export async function fetchStockQuoteMap(symbols?: string[]): Promise<Map<string, number>> {
  const quotes = await fetchStockQuotes(symbols)
  const map = new Map<string, number>()
  for (const row of quotes) {
    if (row.currency !== 'USD') continue
    map.set(row.symbol, row.priceUsd)
    const stripped = stripYahooSymbol(row.symbol)
    if (stripped !== row.symbol) map.set(stripped, row.priceUsd)
  }
  return map
}

export async function fetchUsdKrwRate(): Promise<number> {
  const now = Date.now()
  if (usdKrwCache && now - usdKrwCache.at < QUOTE_CACHE_MS) return usdKrwCache.rate

  const quotes = await fetchQuotesWithFallback([USD_KRW_SYMBOL])
  const quote = quotes.find((row) => row.symbol === USD_KRW_SYMBOL)
  if (!quote || quote.price <= 0) throw new Error('USD/KRW rate unavailable')

  const rate = Math.round(quote.price)
  usdKrwCache = { at: now, rate }
  return rate
}

export type InvestmentQuoteInput = {
  symbol: string
  market: InvestmentMarket
}

export async function fetchInvestmentPriceMap(
  entries: InvestmentQuoteInput[],
): Promise<{ priceMap: Map<string, number>; usdKrwRate: number | null }> {
  if (entries.length === 0) return { priceMap: new Map(), usdKrwRate: null }

  const needsFx = entries.some((row) => row.market === 'overseas')
  const usdKrwRate = needsFx ? await fetchUsdKrwRate() : null

  const yahooSymbols = [...new Set(entries.map((row) => resolveYahooSymbol(row.symbol, row.market)))]
  const quotes = await fetchQuotesWithFallback(yahooSymbols)
  const quoteBySymbol = new Map(quotes.map((row) => [row.symbol, row]))

  const priceMap = new Map<string, number>()
  for (const entry of entries) {
    const userKey = normalizeInvestmentSymbol(entry.symbol)
    const primary = resolveYahooSymbol(entry.symbol, entry.market)
    let quote = quoteBySymbol.get(primary)

    if (!quote && /\.KS$/i.test(primary)) {
      const kqSymbol = primary.replace(/\.KS$/i, '.KQ')
      quote = quoteBySymbol.get(kqSymbol) ?? (await fetchChartQuote(kqSymbol)) ?? undefined
    }

    if (!quote) continue
    const krw =
      entry.market === 'overseas' && usdKrwRate != null
        ? quotePriceToKrw(quote, usdKrwRate)
        : quote.currency === 'KRW'
          ? Math.round(quote.price)
          : usdKrwRate != null
            ? quotePriceToKrw(quote, usdKrwRate)
            : null
    if (krw != null && krw > 0) priceMap.set(userKey, krw)
  }

  return { priceMap, usdKrwRate }
}

export function parseStockSymbolsParam(raw: string | null): string[] | null {
  if (!raw?.trim()) return null
  const symbols = normalizeSymbols(raw.split(','))
  return symbols.length > 0 ? symbols : null
}
