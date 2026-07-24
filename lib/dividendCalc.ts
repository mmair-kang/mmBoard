// 수정: Auto — 2026-07-25 00:57 (배당률 = 세후 원화 기준)
// 수정: Auto — 2026-07-14 23:37

import {
  getDividendHoldingSeed,
  type DividendMarket,
} from '@/lib/dividendHoldingsConfig'

export type { DividendMarket }

/** 월별 금융소득 한도 (1,000만원) */
export const MONTHLY_FINANCIAL_INCOME_LIMIT = 10_000_000

export type DividendEntryLike = {
  exchangeRate: number
  foreignSettlement: number
  foreignTax: number
  shares: number
  /** 국내 ETF 주당 과세표준액 — 있으면 금융소득은 이 기준으로 산정 */
  perShareTaxBaseKrw?: number
}

export type DividendEntryCalc = {
  /** 세후 외화정산금액 */
  settlementForeign: number
  taxForeign: number
  /** 세전 외화 (정산 + 세금) */
  grossForeign: number
  /** 배당금 = 정산 × 환율 */
  dividendKrw: number
  taxKrw: number
  /** 세전 현금배당 원화 = (정산 + 세금) × 환율 */
  grossKrw: number
  /** 금융소득 원화 — 국내 과세표준 우선 */
  financialIncomeKrw: number
  /** 주당 배당 (세후 외화) */
  perShareForeign: number | null
  /** 주당 배당 (세전 외화) */
  perShareGrossForeign: number | null
}

export function calcDividendEntry(entry: DividendEntryLike): DividendEntryCalc {
  const settlementForeign = entry.foreignSettlement
  const taxForeign = entry.foreignTax
  const grossForeign = settlementForeign + taxForeign
  const rate = entry.exchangeRate
  const dividendKrw = Math.round(settlementForeign * rate)
  const taxKrw = Math.round(taxForeign * rate)
  const grossKrw = Math.round(grossForeign * rate)
  const taxBase = entry.perShareTaxBaseKrw ?? 0
  const financialIncomeKrw =
    taxBase > 0 ? Math.round(entry.shares * taxBase) : grossKrw
  const perShareForeign = entry.shares > 0 ? settlementForeign / entry.shares : null
  const perShareGrossForeign = entry.shares > 0 ? grossForeign / entry.shares : null

  return {
    settlementForeign,
    taxForeign,
    grossForeign,
    dividendKrw,
    taxKrw,
    grossKrw,
    financialIncomeKrw,
    perShareForeign,
    perShareGrossForeign,
  }
}

export type DividendMonthSummary = {
  dividendKrw: number
  taxKrw: number
  grossKrw: number
  financialIncome: number
  overMonthlyLimit: boolean
}

export function calcDividendMonthSummary(
  entries: Array<DividendEntryLike & { exchangeRate: number }>,
): DividendMonthSummary {
  let dividendKrw = 0
  let taxKrw = 0
  let grossKrw = 0
  let financialIncome = 0

  for (const entry of entries) {
    const calc = calcDividendEntry(entry)
    dividendKrw += calc.dividendKrw
    taxKrw += calc.taxKrw
    grossKrw += calc.grossKrw
    financialIncome += calc.financialIncomeKrw
  }

  return {
    dividendKrw,
    taxKrw,
    grossKrw,
    financialIncome,
    overMonthlyLimit: financialIncome > MONTHLY_FINANCIAL_INCOME_LIMIT,
  }
}

export function calcYearFinancialIncome(
  months: Array<{ yearMonth: string; entries: DividendEntryLike[] }>,
  year: string,
): number {
  return months
    .filter((month) => month.yearMonth.startsWith(`${year}-`))
    .reduce((sum, month) => sum + calcDividendMonthSummary(month.entries).financialIncome, 0)
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatRate(value: number): string {
  return value.toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function formatKrw(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

/** 배당금 세전(grossKrw) · 세후(dividendKrw) */
export function formatDividendGrossNet(grossKrw: number, dividendKrw: number): string {
  return `세전 ${formatKrw(grossKrw)} · 세후 ${formatKrw(dividendKrw)}`
}

export const US_WITHHOLDING_RATE = 0.15
/** 국내 배당 원천징수(소득세+지방소득세) */
export const DOMESTIC_WITHHOLDING_RATE = 0.154

/** 국내 ETF — 과세표준액 기준 원천세·세후 입금 */
export function calcDomesticTaxFromTaxBase(shares: number, perShareTaxBaseKrw: number): number {
  if (shares <= 0 || perShareTaxBaseKrw <= 0) return 0
  const taxableTotal = Math.round(shares * perShareTaxBaseKrw)
  return Math.round(taxableTotal * DOMESTIC_WITHHOLDING_RATE)
}

export function calcDomesticNetFromCashAndTaxBase(
  shares: number,
  perShareDividendKrw: number,
  perShareTaxBaseKrw: number,
): { cashGross: number; taxKrw: number; netKrw: number; taxableKrw: number } {
  const cashGross = Math.round(shares * perShareDividendKrw)
  const taxableKrw = Math.round(shares * perShareTaxBaseKrw)
  const taxKrw = calcDomesticTaxFromTaxBase(shares, perShareTaxBaseKrw)
  return {
    cashGross,
    taxKrw,
    netKrw: cashGross - taxKrw,
    taxableKrw,
  }
}

export type HoldingReferenceInput = {
  ticker: string
  market: DividendMarket
  quoteSymbol?: string
  defaultShares: number
  perShareDividendUsd: number
  perShareDividendKrw: number
  perShareTaxBaseKrw?: number
  referencePriceUsd: number
  referencePriceKrw: number
  referenceExchangeRate: number
}

export type HoldingReferenceCalc = {
  grossMonthlyUsd: number
  netMonthlyUsd: number
  grossKrw: number | null
  netKrw: number | null
  /** 국내 금융소득(과세표준 총액) — 해외는 grossKrw와 동일 */
  taxableKrw: number | null
  yieldPercent: number | null
}

/** 배당률용 주가($) — 실시간 시세 우선 */
export function resolveHoldingPriceUsd(
  holding: Pick<HoldingReferenceInput, 'ticker' | 'quoteSymbol' | 'referencePriceUsd'>,
  marketPriceUsd?: number | null,
): number {
  if (marketPriceUsd != null && marketPriceUsd > 0) return marketPriceUsd
  if (holding.referencePriceUsd > 0) return holding.referencePriceUsd
  return (
    getDividendHoldingSeed(holding.ticker)?.yieldHintPrice ??
    (holding.quoteSymbol ? getDividendHoldingSeed(holding.quoteSymbol)?.yieldHintPrice : undefined) ??
    0
  )
}

/** 배당률용 주가(원) — 실시간 시세 우선 */
export function resolveHoldingPriceKrw(
  holding: Pick<HoldingReferenceInput, 'ticker' | 'quoteSymbol' | 'referencePriceKrw'>,
  marketPriceKrw?: number | null,
): number {
  if (marketPriceKrw != null && marketPriceKrw > 0) return marketPriceKrw
  if (holding.referencePriceKrw > 0) return holding.referencePriceKrw
  const seed =
    getDividendHoldingSeed(holding.ticker) ??
    (holding.quoteSymbol ? getDividendHoldingSeed(holding.quoteSymbol) : undefined)
  return seed?.market === 'domestic' ? (seed.yieldHintPrice ?? 0) : 0
}

/**
 * 연 배당률(세후 %) = (월 세후 주당배당 × 12 ÷ 주가) × 100
 * 주당배당·주가는 동일 통화(원 권장)여야 함.
 */
export function calcAnnualDividendYieldPercent(
  monthlyPerShareNet: number,
  price: number,
): number | null {
  if (price <= 0 || monthlyPerShareNet <= 0) return null
  return Math.round(((monthlyPerShareNet * 12) / price) * 1000) / 10
}

/** 보유 포트폴리오 가중 연 배당률(세후 원화 %) — 합계 행용 */
export function calcPortfolioYieldPercent(
  rows: Array<{
    market: DividendMarket
    defaultShares: number
    netKrw: number | null
    livePriceUsd: number | null
    livePriceKrw: number | null
    referencePriceUsd: number
    referencePriceKrw: number
    referenceExchangeRate: number
    ticker: string
    quoteSymbol?: string
  }>,
): number | null {
  let annualNetKrw = 0
  let marketValueKrw = 0

  for (const row of rows) {
    if (row.defaultShares <= 0 || row.netKrw == null || !(row.netKrw > 0)) continue

    if (row.market === 'domestic') {
      const price = resolveHoldingPriceKrw(row, row.livePriceKrw)
      if (price <= 0) continue
      annualNetKrw += row.netKrw * 12
      marketValueKrw += row.defaultShares * price
      continue
    }

    const priceUsd = resolveHoldingPriceUsd(row, row.livePriceUsd)
    if (priceUsd <= 0) continue
    const rate = row.referenceExchangeRate > 0 ? row.referenceExchangeRate : 0
    if (rate <= 0) continue
    annualNetKrw += row.netKrw * 12
    marketValueKrw += Math.round(row.defaultShares * priceUsd * rate)
  }

  if (marketValueKrw <= 0) return null
  return Math.round((annualNetKrw / marketValueKrw) * 1000) / 10
}

export function calcDomesticHoldingReference(
  holding: Pick<
    HoldingReferenceInput,
    'ticker' | 'defaultShares' | 'perShareDividendKrw' | 'perShareTaxBaseKrw' | 'referencePriceKrw'
  >,
  marketPriceKrw?: number | null,
): HoldingReferenceCalc {
  const shares = holding.defaultShares
  const perShare = holding.perShareDividendKrw
  const taxBase = holding.perShareTaxBaseKrw ?? 0
  const { cashGross, netKrw, taxableKrw } = calcDomesticNetFromCashAndTaxBase(
    shares,
    perShare,
    taxBase,
  )

  const price = resolveHoldingPriceKrw(holding, marketPriceKrw)
  const netPerShare =
    shares > 0 ? netKrw / shares : calcDomesticNetFromCashAndTaxBase(1, perShare, taxBase).netKrw
  const yieldPercent = calcAnnualDividendYieldPercent(netPerShare, price)

  return {
    grossMonthlyUsd: 0,
    netMonthlyUsd: 0,
    grossKrw: cashGross,
    netKrw,
    taxableKrw,
    yieldPercent,
  }
}

export function calcHoldingReference(
  holding: HoldingReferenceInput,
  marketPriceUsd?: number | null,
  marketPriceKrw?: number | null,
): HoldingReferenceCalc {
  if (holding.market === 'domestic') {
    return calcDomesticHoldingReference(holding, marketPriceKrw)
  }

  const shares = holding.defaultShares
  const perShare = holding.perShareDividendUsd
  const grossMonthlyUsd = shares * perShare
  const netMonthlyUsd = grossMonthlyUsd * (1 - US_WITHHOLDING_RATE)
  const rate = holding.referenceExchangeRate

  const priceUsd = resolveHoldingPriceUsd(holding, marketPriceUsd)
  const grossKrw = rate > 0 ? Math.round(grossMonthlyUsd * rate) : null
  const netKrw = rate > 0 ? Math.round(netMonthlyUsd * rate) : null

  const netPerShareKrw =
    rate > 0
      ? shares > 0 && netKrw != null
        ? netKrw / shares
        : perShare * (1 - US_WITHHOLDING_RATE) * rate
      : 0
  const priceKrw = rate > 0 ? priceUsd * rate : 0
  const yieldPercent = calcAnnualDividendYieldPercent(netPerShareKrw, priceKrw)

  return {
    grossMonthlyUsd,
    netMonthlyUsd,
    grossKrw,
    netKrw,
    taxableKrw: grossKrw,
    yieldPercent,
  }
}

export function formatYieldPercent(value: number | null): string {
  if (value == null) return '—'
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`
}
