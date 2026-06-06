'use client'

import useSWR from 'swr'

import type { IntervalUnit } from '@/lib/ddaySchedule'

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
  const res = await fetch(ddayItemsSwrKey)
  if (!res.ok) throw new Error('D-day 목록을 불러오지 못했습니다.')
  return res.json() as Promise<DdayItem[]>
}

export function useDdayItems() {
  const swr = useSWR<DdayItem[]>(ddayItemsSwrKey, ddayItemsFetcher, {
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
