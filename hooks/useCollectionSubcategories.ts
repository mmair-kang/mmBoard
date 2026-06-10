'use client'
// 수정: Auto — 2026-06-08

import type { CollectionMainKey, CollectionSubEntry } from '@/config/collectionCategories'
import { requestJson } from '@/lib/api/http'
import { defaultSubEntries } from '@/lib/collectionSubcategoryStore'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

type Response = { main: CollectionMainKey; subs: CollectionSubEntry[] }

export function collectionSubcategoriesKey(main: CollectionMainKey) {
  return `/api/collection-subcategories?main=${main}`
}

export function useCollectionSubcategories(main: CollectionMainKey) {
  const key = collectionSubcategoriesKey(main)
  const swr = useSWR<Response>(key, (url: string) => swrJsonFetch<Response>(url, '소분류를 불러오지 못했습니다.'))

  const subs = swr.data?.subs ?? defaultSubEntries(main)

  const saveSubs = async (rows: { key?: string | null; label: string }[]) => {
    const res = await requestJson<Response>(key, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ main, subs: rows }),
    })
    await swr.mutate(res, { revalidate: false })
    return res.subs
  }

  return {
    subs,
    isLoading: swr.isLoading && !swr.data,
    error: swr.error instanceof Error ? swr.error.message : '',
    saveSubs,
    mutate: swr.mutate,
  }
}
