// 수정: Auto — 2026-07-24 16:21 (시세코드·표시명 매칭)
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

export function getDividendHoldingSeed(tickerOrSymbol: string): DividendHoldingSeed | undefined {
  const key = tickerOrSymbol.trim().toUpperCase()
  if (!key) return undefined
  return DIVIDEND_HOLDING_SEEDS.find(
    (row) => row.ticker.toUpperCase() === key || row.quoteSymbol.toUpperCase() === key,
  )
}

export function isDomesticDividendTicker(ticker: string): boolean {
  return getDividendHoldingSeed(ticker)?.market === 'domestic'
}
