'use client'
// 수정: Auto — 2026-07-27 02:39 (금액 여러 건)
// 수정: Auto — 2026-07-27 02:17 (검사항목·결과·권고사항 분리)
// 수정: Auto — 2026-07-27 02:09

import type { EndoscopyCostItem } from '@/lib/endoscopyPayload'
import { parseStoredEndoscopyCostItems } from '@/lib/endoscopyPayload'
import type { HealthExamScopeId } from '@/lib/endoscopyTypes'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export interface EndoscopyRecord {
  id: number
  scopeType: HealthExamScopeId
  examDate: string
  examItem: string
  result: string
  recommendation: string
  /** JSON string from API */
  costItems: string
  /** 이전 데이터 호환 */
  content: string
  createdAt: string
}

export function endoscopyRecordCosts(item: EndoscopyRecord): EndoscopyCostItem[] {
  return parseStoredEndoscopyCostItems(item.costItems)
}

export function endoscopyRecordsSwrKey(scope: HealthExamScopeId) {
  return `/api/endoscopy-records?scope=${scope}` as const
}

function sortByDateDesc(rows: EndoscopyRecord[]): EndoscopyRecord[] {
  return [...rows].sort((a, b) => (a.examDate === b.examDate ? 0 : a.examDate < b.examDate ? 1 : -1))
}

export function useEndoscopyRecords(scope: HealthExamScopeId) {
  const key = endoscopyRecordsSwrKey(scope)
  const swr = useSWR<EndoscopyRecord[]>(key, async () =>
    sortByDateDesc(await swrJsonFetch<EndoscopyRecord[]>(key, '내시경 기록을 불러오지 못했습니다.')),
  )

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
    sortByDateDesc,
  }
}
