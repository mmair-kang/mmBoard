// 수정: Auto — 2026-06-08

/** 월별 금융소득 한도 (1,000만원) */
export const MONTHLY_FINANCIAL_INCOME_LIMIT = 10_000_000

export type DividendEntryLike = {
  exchangeRate: number
  foreignSettlement: number
  foreignTax: number
  shares: number
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
  /** 금융소득 = (정산 + 세금) × 환율 */
  grossKrw: number
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
  const perShareForeign = entry.shares > 0 ? settlementForeign / entry.shares : null
  const perShareGrossForeign = entry.shares > 0 ? grossForeign / entry.shares : null

  return {
    settlementForeign,
    taxForeign,
    grossForeign,
    dividendKrw,
    taxKrw,
    grossKrw,
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

  for (const entry of entries) {
    const calc = calcDividendEntry(entry)
    dividendKrw += calc.dividendKrw
    taxKrw += calc.taxKrw
    grossKrw += calc.grossKrw
  }

  const financialIncome = grossKrw

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

/** 연 배당률(%) 추정용 참고 시세 — 사용자 기준가 미입력 시에만 사용 */
const YIELD_HINT_PRICE_USD: Record<string, number> = {
  JEPQ: 54,
  GPIX: 28,
}

export const US_WITHHOLDING_RATE = 0.15

export type HoldingReferenceInput = {
  ticker: string
  defaultShares: number
  perShareDividendUsd: number
  referencePriceUsd: number
  referenceExchangeRate: number
}

export type HoldingReferenceCalc = {
  grossMonthlyUsd: number
  netMonthlyUsd: number
  grossKrw: number | null
  netKrw: number | null
  yieldPercent: number | null
}

/** 배당률용 주가 — 실시간 시세 우선 */
export function resolveHoldingPriceUsd(
  holding: Pick<HoldingReferenceInput, 'ticker' | 'referencePriceUsd'>,
  marketPriceUsd?: number | null,
): number {
  if (marketPriceUsd != null && marketPriceUsd > 0) return marketPriceUsd
  if (holding.referencePriceUsd > 0) return holding.referencePriceUsd
  return YIELD_HINT_PRICE_USD[holding.ticker] ?? 0
}

/**
 * 연 배당률(세전 %) = (월 주당배당$ × 12 ÷ 주가$) × 100
 * 주식수는 월·연 배당금 총액에만 반영되고, 배당률 % 자체에는 영향 없음.
 */
export function calcAnnualDividendYieldPercent(
  monthlyPerShareDividendUsd: number,
  priceUsd: number,
): number | null {
  if (priceUsd <= 0 || monthlyPerShareDividendUsd <= 0) return null
  return Math.round(((monthlyPerShareDividendUsd * 12) / priceUsd) * 1000) / 10
}

/** 보유 포트폴리오 가중 연 배당률(세전 %) — 합계 행용 */
export function calcPortfolioYieldPercent(
  rows: Array<{
    defaultShares: number
    perShareDividendUsd: number
    livePriceUsd: number | null
    referencePriceUsd: number
    ticker: string
  }>,
): number | null {
  let annualDividendUsd = 0
  let marketValueUsd = 0

  for (const row of rows) {
    if (row.defaultShares <= 0 || row.perShareDividendUsd <= 0) continue
    const price = resolveHoldingPriceUsd(row, row.livePriceUsd)
    if (price <= 0) continue
    annualDividendUsd += row.defaultShares * row.perShareDividendUsd * 12
    marketValueUsd += row.defaultShares * price
  }

  if (marketValueUsd <= 0) return null
  return Math.round((annualDividendUsd / marketValueUsd) * 1000) / 10
}

export function calcHoldingReference(
  holding: HoldingReferenceInput,
  marketPriceUsd?: number | null,
): HoldingReferenceCalc {
  const shares = holding.defaultShares
  const perShare = holding.perShareDividendUsd
  const grossMonthlyUsd = shares * perShare
  const netMonthlyUsd = grossMonthlyUsd * (1 - US_WITHHOLDING_RATE)
  const rate = holding.referenceExchangeRate

  const price = resolveHoldingPriceUsd(holding, marketPriceUsd)
  const yieldPercent = calcAnnualDividendYieldPercent(perShare, price)

  const grossKrw = rate > 0 ? Math.round(grossMonthlyUsd * rate) : null
  const netKrw = rate > 0 ? Math.round(netMonthlyUsd * rate) : null

  return { grossMonthlyUsd, netMonthlyUsd, grossKrw, netKrw, yieldPercent }
}

export function formatYieldPercent(value: number | null): string {
  if (value == null) return '—'
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`
}
