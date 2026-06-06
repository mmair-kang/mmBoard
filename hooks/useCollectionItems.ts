'use client'
// 수정: Auto — 2026-06-05 (전체 검색)

import useSWR from 'swr'

import type {
  CollectionMainKey,
  CollectionSubKey,
} from '@/config/collectionCategories'
import type { CollectionAmountUnit, PackType } from '@/config/shoppingCategories'
import type {
  CollectionOptionData,
  CollectionOptionType,
} from '@/config/collectionOptions'
import type { CollectionStoreKey } from '@/config/collectionCategories'

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
  const res = await fetch(url)
  if (!res.ok) throw new Error('소장 목록을 불러오지 못했습니다.')
  return res.json() as Promise<CollectionItem[]>
}

export function useCollectionItems(main: CollectionMainKey, sub: CollectionSubKey) {
  const key = collectionItemsKey(main, sub)
  const swr = useSWR<CollectionItem[]>(key, collectionItemsFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  })

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading,
    error: swr.error,
    mutate: swr.mutate,
  }
}

export function useAllCollectionItems() {
  const swr = useSWR<CollectionItem[]>(allCollectionItemsKey, collectionItemsFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading,
    error: swr.error,
    mutate: swr.mutate,
  }
}
