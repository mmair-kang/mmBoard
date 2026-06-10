'use client'
// 수정: Auto — 2026-06-08

import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const monthlyExpensesSwrKey = '/api/monthly-expenses' as const

export type MonthlyExpensePayType = 'card' | 'cash'

export interface MonthlyExpense {
  id: number
  title: string
  dayOfMonth: number | null
  amount: number
  payType: MonthlyExpensePayType
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
