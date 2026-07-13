// 수정: Auto — 2026-07-14 02:00

export type DividendMarket = 'overseas' | 'domestic'

export type DividendHoldingSeed = {
  ticker: string
  market: DividendMarket
  /** Yahoo/KRX 시세 조회용 심볼 */
  quoteSymbol: string
  defaultShares?: number
  /** 배당률 추정용 참고 시세 (해외=$ · 국내=원) */
  yieldHintPrice?: number
}

export const DIVIDEND_HOLDING_SEEDS: DividendHoldingSeed[] = [
  { ticker: 'JEPQ', market: 'overseas', quoteSymbol: 'JEPQ', yieldHintPrice: 54 },
  { ticker: 'GPIX', market: 'overseas', quoteSymbol: 'GPIX', yieldHintPrice: 28 },
  {
    ticker: 'KODEX',
    market: 'domestic',
    quoteSymbol: '498400',
    defaultShares: 800,
    yieldHintPrice: 28_215,
  },
]

export const DIVIDEND_TICKER_ORDER = DIVIDEND_HOLDING_SEEDS.map((row) => row.ticker)

export function getDividendHoldingSeed(ticker: string): DividendHoldingSeed | undefined {
  return DIVIDEND_HOLDING_SEEDS.find((row) => row.ticker === ticker.trim().toUpperCase())
}

export function isDomesticDividendTicker(ticker: string): boolean {
  return getDividendHoldingSeed(ticker)?.market === 'domestic'
}
