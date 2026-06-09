'use client'
// 수정: Auto — 2026-06-08

import useSWR from 'swr'

export const annualPaymentsSwrKey = '/api/annual-payments' as const

export interface AnnualPayment {
  id: number
  title: string
  month: number
  dayOfMonth: number | null
  amount: number
  switchOn: boolean
  progressYear: string
  sortOrder: number
  createdAt: string
}

async function annualPaymentsFetcher(): Promise<AnnualPayment[]> {
  const res = await fetch(annualPaymentsSwrKey)
  if (!res.ok) throw new Error('연납 목록을 불러오지 못했습니다.')
  return res.json() as Promise<AnnualPayment[]>
}

export function useAnnualPayments() {
  const swr = useSWR<AnnualPayment[]>(annualPaymentsSwrKey, annualPaymentsFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 3000,
    keepPreviousData: true,
  })

  return {
    payments: swr.data ?? [],
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
