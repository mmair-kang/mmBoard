'use client'
// 수정: Auto — 2026-06-08

import { swrJsonFetch } from '@/lib/swrFetch'
import type { IntervalUnit } from '@/lib/ddaySchedule'
import useSWR from 'swr'

export const ddayItemsSwrKey = '/api/dday-items' as const

export interface DdayItem {
  id: number
  name: string
  lastVisitDate: string
  intervalValue: number
  intervalUnit: IntervalUnit
  createdAt: string
}

async function ddayItemsFetcher(): Promise<DdayItem[]> {
  return swrJsonFetch<DdayItem[]>(ddayItemsSwrKey, 'D-day 목록을 불러오지 못했습니다.')
}

export function useDdayItems() {
  const swr = useSWR<DdayItem[]>(ddayItemsSwrKey, ddayItemsFetcher)

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
