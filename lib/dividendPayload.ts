// 수정: Auto — 2026-07-14 23:37

import { calcDomesticNetFromCashAndTaxBase } from '@/lib/dividendCalc'

export type DividendEntryPayload = {
  id?: number
  dayOfMonth: number
  ticker: string
  shares: number
  exchangeRate: number
  foreignSettlement: number
  foreignTax: number
  /** 국내 ETF 주당 과세표준액 */
  perShareTaxBaseKrw?: number
}

export type DividendMonthPayload = {
  yearMonth: string
  entries: DividendEntryPayload[]
}

export type DividendHoldingPayload = {
  id?: number
  ticker: string
  market?: 'overseas' | 'domestic'
  quoteSymbol?: string
  defaultShares: number
  perShareDividendUsd: number
  perShareDividendKrw?: number
  perShareTaxBaseKrw?: number
  referencePriceUsd?: number
  referencePriceKrw?: number
  referenceExchangeRate?: number
}

function parsePositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n)
}

function parseDayOfMonth(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 1 || n > 31) return null
  return Math.round(n)
}

export function sanitizeDecimalInput(raw: string): string {
  let cleaned = raw.replace(/[^\d.]/g, '')
  const dotIndex = cleaned.indexOf('.')
  if (dotIndex >= 0) {
    cleaned = cleaned.slice(0, dotIndex + 1) + cleaned.slice(dotIndex + 1).replace(/\./g, '')
  }
  return cleaned
}

export function decimalToText(value: number): string {
  if (!value) return ''
  return String(value)
}

export function parseDecimalText(text: string): number {
  const cleaned = text.trim()
  if (!cleaned || cleaned === '.') return 0
  const parsed = Number(cleaned)
  if (!Number.isFinite(parsed)) return 0
  return parsed
}

export function parseDecimal(value: unknown): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) return null
    return value
  }
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function parseYearMonth(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (!/^\d{4}-\d{2}$/.test(value)) return null
  const month = Number(value.slice(5, 7))
  if (month < 1 || month > 12) return null
  return value
}

export function parseDividendEntryPayload(value: unknown): DividendEntryPayload | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const dayOfMonth = parseDayOfMonth(row.dayOfMonth)
  const ticker = typeof row.ticker === 'string' ? row.ticker.trim().toUpperCase() : ''
  const shares = parsePositiveInt(row.shares)
  const exchangeRate = parseDecimal(row.exchangeRate)
  const foreignSettlement = parseDecimal(row.foreignSettlement)
  const foreignTax = parseDecimal(row.foreignTax)
  const perShareTaxBaseKrw = parseDecimal(row.perShareTaxBaseKrw) ?? 0

  if (
    dayOfMonth == null ||
    !ticker ||
    shares == null ||
    exchangeRate == null ||
    exchangeRate <= 0 ||
    foreignSettlement == null ||
    foreignTax == null
  ) {
    return null
  }

  return {
    id: typeof row.id === 'number' ? row.id : undefined,
    dayOfMonth,
    ticker,
    shares,
    exchangeRate,
    foreignSettlement,
    foreignTax,
    perShareTaxBaseKrw,
  }
}

export function parseDividendMonthPayload(body: Record<string, unknown>): DividendMonthPayload | null {
  const yearMonth = parseYearMonth(body.yearMonth)
  if (!yearMonth) return null
  if (!Array.isArray(body.entries) || body.entries.length === 0) return null

  const entries: DividendEntryPayload[] = []
  for (const item of body.entries) {
    const parsed = parseDividendEntryPayload(item)
    if (!parsed) return null
    entries.push(parsed)
  }

  return { yearMonth, entries }
}

export function parseDividendHoldingsPayload(body: Record<string, unknown>): DividendHoldingPayload[] | null {
  if (!Array.isArray(body.holdings)) return null
  const holdings: DividendHoldingPayload[] = []

  for (const item of body.holdings) {
    if (!item || typeof item !== 'object') return null
    const row = item as Record<string, unknown>
    const ticker =
      typeof row.ticker === 'string' ? row.ticker.trim() : ''
    const defaultShares = parsePositiveInt(row.defaultShares)
    const perShareDividendUsd = parseDecimal(row.perShareDividendUsd) ?? 0
    const perShareDividendKrw = parseDecimal(row.perShareDividendKrw) ?? 0
    const perShareTaxBaseKrw = parseDecimal(row.perShareTaxBaseKrw) ?? 0
    const referencePriceUsd = parseDecimal(row.referencePriceUsd) ?? 0
    const referencePriceKrw = parseDecimal(row.referencePriceKrw) ?? 0
    const market = row.market === 'domestic' ? 'domestic' : row.market === 'overseas' ? 'overseas' : undefined
    const quoteSymbol =
      typeof row.quoteSymbol === 'string' ? row.quoteSymbol.trim().toUpperCase() : undefined
    if (
      !ticker ||
      defaultShares == null ||
      perShareDividendUsd < 0 ||
      perShareDividendKrw < 0 ||
      perShareTaxBaseKrw < 0 ||
      referencePriceUsd < 0 ||
      referencePriceKrw < 0
    ) {
      return null
    }
    const referenceExchangeRate = parseDecimal(row.referenceExchangeRate) ?? undefined
    if (referenceExchangeRate != null && referenceExchangeRate < 0) return null
    holdings.push({
      id: typeof row.id === 'number' ? row.id : undefined,
      // 해외 티커는 대문자, 국내 종목명(한글·혼합)은 원문 유지
      ticker: /^[A-Za-z0-9._-]+$/.test(ticker) ? ticker.toUpperCase() : ticker,
      ...(market ? { market } : {}),
      ...(quoteSymbol ? { quoteSymbol } : {}),
      defaultShares,
      perShareDividendUsd,
      perShareDividendKrw,
      perShareTaxBaseKrw,
      referencePriceUsd,
      referencePriceKrw,
      ...(referenceExchangeRate != null ? { referenceExchangeRate } : {}),
    })
  }

  return holdings
}

export function entriesFromHoldings(
  holdings: Array<{
    ticker: string
    defaultShares: number
    market?: 'overseas' | 'domestic'
    perShareDividendUsd?: number
    perShareDividendKrw?: number
    perShareTaxBaseKrw?: number
  }>,
): DividendEntryPayload[] {
  return holdings.map((row) => {
    const domestic = row.market === 'domestic'
    if (domestic) {
      const perShare = row.perShareDividendKrw ?? 0
      const taxBase = row.perShareTaxBaseKrw ?? 0
      const { taxKrw, netKrw } = calcDomesticNetFromCashAndTaxBase(
        row.defaultShares,
        perShare,
        taxBase,
      )
      return {
        dayOfMonth: 1,
        ticker: row.ticker,
        shares: row.defaultShares,
        exchangeRate: 1,
        foreignSettlement: perShare > 0 ? netKrw : 0,
        foreignTax: perShare > 0 ? taxKrw : 0,
        perShareTaxBaseKrw: taxBase,
      }
    }

    return {
      dayOfMonth: 1,
      ticker: row.ticker,
      shares: row.defaultShares,
      exchangeRate: 0,
      foreignSettlement: 0,
      foreignTax: 0,
      perShareTaxBaseKrw: 0,
    }
  })
}
