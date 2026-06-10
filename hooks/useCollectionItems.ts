'use client'
// 수정: Auto — 2026-06-08

import type {
  CollectionMainKey,
  CollectionStoreKey,
  CollectionSubKey,
} from '@/config/collectionCategories'
import type { CollectionOptionData, CollectionOptionType } from '@/config/collectionOptions'
import type { CollectionAmountUnit, PackType } from '@/config/shoppingCategories'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export interface CollectionItem {
  id: number
  mainCategory: CollectionMainKey
  subCategory: CollectionSubKey
  brand: string
  name: string
  nameSuffix: string
  model: string
  size: string
  description: string
  purchasePrice: number
  storeKey: CollectionStoreKey
  storeCustom: string | null
  purchaseDate: string
  amount: number
  amountUnit: CollectionAmountUnit
  packType: PackType
  packCount: number
  unitsPerPack: number
  optionType: CollectionOptionType
  optionData: CollectionOptionData
  imageData: string | null
  createdAt: string
}

export function collectionItemsKey(main: CollectionMainKey, sub: CollectionSubKey) {
  return `/api/collection-items?main=${main}&sub=${sub}` as const
}

export const allCollectionItemsKey = '/api/collection-items?scope=all' as const

async function collectionItemsFetcher(url: string): Promise<CollectionItem[]> {
  return swrJsonFetch<CollectionItem[]>(url, '소장 목록을 불러오지 못했습니다.')
}

export function useCollectionItems(main: CollectionMainKey, sub: CollectionSubKey) {
  const key = collectionItemsKey(main, sub)
  const swr = useSWR<CollectionItem[]>(key, collectionItemsFetcher)

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}

export function useAllCollectionItems(enabled: boolean) {
  const swr = useSWR<CollectionItem[]>(enabled ? allCollectionItemsKey : null, collectionItemsFetcher)

  return {
    items: swr.data ?? [],
    isLoading: enabled && swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}
