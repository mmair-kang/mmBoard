'use client'
// 수정: Auto — 2026-07-27 01:56

import { sortHealthCheckupsByDateDesc } from '@/lib/healthCheckupFormat'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const healthCheckupsSwrKey = '/api/health-checkups' as const

export interface HealthCheckup {
  id: number
  checkupDate: string
  age: number | null
  heightCm: number | null
  weightKg: number | null
  bmi: number | null
  waistCm: number | null
  visionLeft: number | null
  visionRight: number | null
  bpSystolic: number | null
  bpDiastolic: number | null
  fastingGlucose: number | null
  totalCholesterol: number | null
  hdl: number | null
  triglycerides: number | null
  ldl: number | null
  createdAt: string
}

async function healthCheckupsFetcher(): Promise<HealthCheckup[]> {
  const rows = await swrJsonFetch<HealthCheckup[]>(
    healthCheckupsSwrKey,
    '검진 기록을 불러오지 못했습니다.',
  )
  return sortHealthCheckupsByDateDesc(rows)
}

export function useHealthCheckups() {
  const swr = useSWR<HealthCheckup[]>(healthCheckupsSwrKey, healthCheckupsFetcher)

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}
