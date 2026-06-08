'use client'
// 수정: Auto — 2026-06-08

import useSWR from 'swr'

import type { MonthlyTaskOptionType } from '@/lib/monthlyTaskPayload'

export const monthlyTasksSwrKey = '/api/monthly-tasks' as const

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
}

async function monthlyTasksFetcher(): Promise<MonthlyTask[]> {
  const res = await fetch(monthlyTasksSwrKey)
  if (!res.ok) throw new Error('한달할일 목록을 불러오지 못했습니다.')
  return res.json() as Promise<MonthlyTask[]>
}

export function useMonthlyTasks() {
  const swr = useSWR<MonthlyTask[]>(monthlyTasksSwrKey, monthlyTasksFetcher, {
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
