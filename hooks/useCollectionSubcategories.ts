'use client'
// 수정: Auto — 2026-06-05

import useSWR from 'swr'

import { defaultSubEntries } from '@/lib/collectionSubcategoryStore'
import type { CollectionSubEntry } from '@/config/collectionCategories'
import { fetchJson, requestJson } from '@/lib/api/http'
import type { CollectionMainKey } from '@/config/collectionCategories'

type Response = { main: CollectionMainKey; subs: CollectionSubEntry[] }

export function collectionSubcategoriesKey(main: CollectionMainKey) {
  return `/api/collection-subcategories?main=${main}`
}

export function useCollectionSubcategories(main: CollectionMainKey) {
  const swr = useSWR<Response>(collectionSubcategoriesKey(main), fetchJson, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  const subs = swr.data?.subs ?? (swr.isLoading ? defaultSubEntries(main) : defaultSubEntries(main))

  const saveSubs = async (rows: { key?: string | null; label: string }[]) => {
    const res = await requestJson<Response>(collectionSubcategoriesKey(main), {
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
