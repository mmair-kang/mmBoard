'use client'
// 수정: Auto — 2026-06-08

import type { InvestmentData } from '@/lib/investmentQuery'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const investmentsSwrKey = '/api/investments' as const

async function investmentsFetcher(): Promise<InvestmentData> {
  return swrJsonFetch<InvestmentData>(investmentsSwrKey, '투자 목록을 불러오지 못했습니다.')
}

export function useInvestments() {
  const swr = useSWR<InvestmentData>(investmentsSwrKey, investmentsFetcher)

  return {
    data: swr.data,
    accounts: swr.data?.accounts ?? [],
    usdKrwRate: swr.data?.usdKrwRate ?? null,
    grandSummary: swr.data?.grandSummary,
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}

export type { InvestmentAccountView, InvestmentData } from '@/lib/investmentQuery'
export type { InvestmentHoldingView } from '@/lib/investmentCalc'
