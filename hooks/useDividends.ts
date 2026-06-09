'use client'
// 수정: Auto — 2026-06-08

import useSWR from 'swr'

export const dividendsSwrKey = '/api/dividends' as const

export interface DividendHolding {
  id: number
  ticker: string
  defaultShares: number
  perShareDividendUsd: number
  referencePriceUsd: number
  referenceExchangeRate: number
  sortOrder: number
  grossMonthlyUsd: number
  netMonthlyUsd: number
  grossKrw: number | null
  netKrw: number | null
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
  sortOrder: number
  dividendKrw: number
  taxKrw: number
  grossKrw: number
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
  const res = await fetch(dividendsSwrKey)
  if (!res.ok) throw new Error('배당 목록을 불러오지 못했습니다.')
  return res.json() as Promise<DividendData>
}

export function useDividends() {
  const swr = useSWR<DividendData>(dividendsSwrKey, dividendsFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 3000,
    keepPreviousData: true,
  })

  return {
    data: swr.data,
    holdings: swr.data?.holdings ?? [],
    months: swr.data?.months ?? [],
    yearFinancialIncome: swr.data?.yearFinancialIncome ?? 0,
    yearLabel: swr.data?.yearLabel ?? '',
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
