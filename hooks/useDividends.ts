'use client'
// 수정: Auto — 2026-08-19 15:48 (보유배당주 종목 링크)
// 수정: Auto — 2026-08-03 10:21 (배당 기준일 recordDayOfMonth)
// 수정: Auto — 2026-07-14 23:51

import { swrJsonFetch } from '@/lib/swrFetch'
import type { DividendMarket } from '@/lib/dividendCalc'
import useSWR from 'swr'

export const dividendsSwrKey = '/api/dividends' as const

export interface DividendHolding {
  id: number
  ticker: string
  market: DividendMarket
  quoteSymbol: string
  defaultShares: number
  perShareDividendUsd: number
  perShareDividendKrw: number
  perShareTaxBaseKrw: number
  referencePriceUsd: number
  referencePriceKrw: number
  referenceExchangeRate: number
  /** 배당 기준일 (1–31), 0=미설정 — 월별 지급일과 별개 */
  recordDayOfMonth: number
  /** 종목 클릭 시 새 창으로 열 페이지 */
  infoUrl: string
  sortOrder: number
  livePriceUsd: number | null
  livePriceKrw: number | null
  grossMonthlyUsd: number
  netMonthlyUsd: number
  grossKrw: number | null
  netKrw: number | null
  taxableKrw: number | null
  yieldPercent: number | null
}

export interface DividendEntry {
  id: number
  monthId: number
  dayOfMonth: number
  ticker: string
  shares: number
  exchangeRate: number
  foreignSettlement: number
  foreignTax: number
  perShareTaxBaseKrw: number
  sortOrder: number
  dividendKrw: number
  taxKrw: number
  grossKrw: number
  financialIncomeKrw: number
  perShareForeign: number | null
  perShareGrossForeign: number | null
}

export interface DividendMonthSummary {
  dividendKrw: number
  taxKrw: number
  grossKrw: number
  financialIncome: number
  overMonthlyLimit: boolean
}

export interface DividendMonth {
  id: number
  yearMonth: string
  createdAt: string
  entries: DividendEntry[]
  summary: DividendMonthSummary
}

export interface DividendData {
  holdings: DividendHolding[]
  months: DividendMonth[]
  yearFinancialIncome: number
  yearLabel: string
}

async function dividendsFetcher(): Promise<DividendData> {
  return swrJsonFetch<DividendData>(dividendsSwrKey, '배당 목록을 불러오지 못했습니다.')
}

export function useDividends() {
  const swr = useSWR<DividendData>(dividendsSwrKey, dividendsFetcher)

  return {
    data: swr.data,
    holdings: swr.data?.holdings ?? [],
    months: swr.data?.months ?? [],
    yearFinancialIncome: swr.data?.yearFinancialIncome ?? 0,
    yearLabel: swr.data?.yearLabel ?? '',
    isLoading: swr.isLoading && !swr.data,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
