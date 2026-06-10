'use client'
// 수정: Auto — 2026-06-08

import { swrJsonFetch } from '@/lib/swrFetch'
import type { MonthlyTaskOptionType } from '@/lib/monthlyTaskPayload'
import useSWR from 'swr'

export const monthlyTasksSwrKey = '/api/monthly-tasks' as const

export interface MonthlyTaskCardExtra {
  id: number
  taskId: number
  extraType: 'payment_switch'
  title: string | null
  dayOfMonth: number | null
  amount: number
  checked: boolean
  switchOn: boolean
  progressMonth: string
  sortOrder: number
  createdAt: string
}

export interface MonthlyTask {
  id: number
  title: string
  dayOfMonth: number | null
  optionType: MonthlyTaskOptionType
  targetAmount: number | null
  currentAmount: number
  switchOn: boolean
  progressMonth: string
  createdAt: string
  cardExtras: MonthlyTaskCardExtra[]
}

async function monthlyTasksFetcher(): Promise<MonthlyTask[]> {
  return swrJsonFetch<MonthlyTask[]>(monthlyTasksSwrKey, '카드 실적 목록을 불러오지 못했습니다.')
}

export function useMonthlyTasks() {
  const swr = useSWR<MonthlyTask[]>(monthlyTasksSwrKey, monthlyTasksFetcher)

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
