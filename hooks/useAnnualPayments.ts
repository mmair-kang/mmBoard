'use client'
// 수정: Auto — 2026-07-19 16:05 (결제방식·카드)
// 수정: Auto — 2026-07-19 16:00 (네이버플러스 멤버십)
// 수정: Auto — 2026-07-19 14:40 (연납 타입·자동차보험)
// 수정: Auto — 2026-06-08

import type { AnnualPaymentPayType, AnnualPaymentType } from '@/lib/annualPaymentTypes'
import type { CarInsuranceAnnualDetail } from '@/lib/carInsuranceAnnualDetail'
import type { CursorProAnnualDetail } from '@/lib/cursorProAnnualDetail'
import type { NaverPlusAnnualDetail } from '@/lib/naverPlusAnnualDetail'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const annualPaymentsSwrKey = '/api/annual-payments' as const

export interface AnnualPayment {
  id: number
  title: string
  month: number
  dayOfMonth: number | null
  amount: number
  paymentType: AnnualPaymentType
  payType: AnnualPaymentPayType
  monthlyTaskId: number | null
  carInsuranceDetail: CarInsuranceAnnualDetail | null
  cursorProDetail: CursorProAnnualDetail | null
  naverPlusDetail: NaverPlusAnnualDetail | null
  switchOn: boolean
  progressYear: string
  sortOrder: number
  createdAt: string
}

async function annualPaymentsFetcher(): Promise<AnnualPayment[]> {
  return swrJsonFetch<AnnualPayment[]>(annualPaymentsSwrKey, '연납 목록을 불러오지 못했습니다.')
}

export function useAnnualPayments() {
  const swr = useSWR<AnnualPayment[]>(annualPaymentsSwrKey, annualPaymentsFetcher)

  return {
    payments: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
