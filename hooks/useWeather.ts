'use client'
// 수정: Auto — 2026-06-11

import { swrJsonFetch } from '@/lib/swrFetch'
import type { WeatherData } from '@/lib/weatherCalc'
import useSWR from 'swr'

export const weatherSwrKey = '/api/weather' as const

async function weatherFetcher(): Promise<WeatherData> {
  return swrJsonFetch<WeatherData>(weatherSwrKey, '날씨를 불러오지 못했습니다.')
}

export function useWeather() {
  const swr = useSWR<WeatherData>(weatherSwrKey, weatherFetcher, {
    dedupingInterval: 20 * 60 * 1000,
    revalidateOnFocus: false,
  })

  return {
    data: swr.data,
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}
