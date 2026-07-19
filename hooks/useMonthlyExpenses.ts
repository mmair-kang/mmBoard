'use client'
// 수정: Auto — 2026-07-19 16:15 (결제 카드)
// 수정: Auto — 2026-07-19 13:10 (보금자리론 타입)
// 수정: Auto — 2026-07-19 13:00 (렌탈 타입)
// 수정: Auto — 2026-07-19 03:40 (보험 계약상세)
// 수정: Auto — 2026-07-19 03:30 (국민연금 고지서형)
// 수정: Auto — 2026-07-19 03:15 (건보 고지서형 상세)
// 수정: Auto — 2026-07-19 03:15 (통신비 타입·상세)

import type { BogeumjariDetail } from '@/lib/bogeumjariExpenseDetail'
import type { HealthInsuranceDetail } from '@/lib/healthInsuranceDetail'
import type { InsuranceDetail } from '@/lib/insuranceExpenseDetail'
import type { NationalPensionDetail } from '@/lib/nationalPensionDetail'
import type { RentalDetail } from '@/lib/rentalExpenseDetail'
import { swrJsonFetch } from '@/lib/swrFetch'
import type { MonthlyExpenseType, TelecomDetail } from '@/lib/telecomExpenseDetail'
import useSWR from 'swr'

export const monthlyExpensesSwrKey = '/api/monthly-expenses' as const

export type MonthlyExpensePayType = 'card' | 'cash'

export interface MonthlyExpense {
  id: number
  title: string
  dayOfMonth: number | null
  amount: number
  payType: MonthlyExpensePayType
  monthlyTaskId: number | null
  expenseType: MonthlyExpenseType
  telecomDetail: TelecomDetail | null
  healthInsuranceDetail: HealthInsuranceDetail | null
  nationalPensionDetail: NationalPensionDetail | null
  insuranceDetail: InsuranceDetail | null
  rentalDetail: RentalDetail | null
  bogeumjariDetail: BogeumjariDetail | null
  sortOrder: number
  createdAt: string
}

async function monthlyExpensesFetcher(): Promise<MonthlyExpense[]> {
  return swrJsonFetch<MonthlyExpense[]>(monthlyExpensesSwrKey, '한달 고정비 목록을 불러오지 못했습니다.')
}

export function useMonthlyExpenses() {
  const swr = useSWR<MonthlyExpense[]>(monthlyExpensesSwrKey, monthlyExpensesFetcher)

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
