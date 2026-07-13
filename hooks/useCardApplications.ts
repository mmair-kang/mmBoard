'use client'
// 수정: Auto — 2026-07-12 23:36

import { swrJsonFetch } from '@/lib/swrFetch'
import type { CardApplication } from '@/lib/cardApplicationQuery'
import useSWR from 'swr'

export const cardApplicationsSwrKey = '/api/card-applications' as const

async function cardApplicationsFetcher(): Promise<CardApplication[]> {
  return swrJsonFetch<CardApplication[]>(cardApplicationsSwrKey, '카드 신청 목록을 불러오지 못했습니다.')
}

export function useCardApplications() {
  const swr = useSWR<CardApplication[]>(cardApplicationsSwrKey, cardApplicationsFetcher)

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}

export type { CardApplication } from '@/lib/cardApplicationQuery'
