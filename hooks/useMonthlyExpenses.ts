'use client'
// 수정: Auto — 2026-06-08

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
  const res = await fetch(monthlyExpensesSwrKey)
  if (!res.ok) throw new Error('한달 고정비 목록을 불러오지 못했습니다.')
  return res.json() as Promise<MonthlyExpense[]>
}

export function useMonthlyExpenses() {
  const swr = useSWR<MonthlyExpense[]>(monthlyExpensesSwrKey, monthlyExpensesFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 3000,
    keepPreviousData: true,
  })

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
