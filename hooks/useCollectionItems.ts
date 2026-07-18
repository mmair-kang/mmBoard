'use client'
// 수정: Auto — 2026-07-19 00:15 (product·변형)

import type {
  CollectionMainKey,
  CollectionStoreKey,
  CollectionSubKey,
  FoodScopeKey,
} from '@/config/collectionCategories'
import type { CollectionOptionData, CollectionOptionType } from '@/config/collectionOptions'
import type { CollectionAmountUnit, PackType } from '@/config/shoppingCategories'
import type { CollectionFoodListChipFlags } from '@/lib/collectionFoodListChips'
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
  repurchaseDays: number | null
  repurchaseActive: boolean
  foodScope: FoodScopeKey
  hidden: boolean
  productId: number | null
  isSelected: boolean
  createdAt: string
}

export interface CollectionProduct {
  id: number
  name: string
  mainCategory: CollectionMainKey
  subCategory: CollectionSubKey
  foodScope: FoodScopeKey
  listChipFlags: CollectionFoodListChipFlags
  createdAt: string
  variants: CollectionItem[]
  selectedVariantId: number | null
}

export function collectionItemsKey(
  main: CollectionMainKey,
  sub: CollectionSubKey,
  foodScope?: FoodScopeKey,
) {
  if (main === 'food' && foodScope) {
    return `/api/collection-items?main=food&sub=${encodeURIComponent(sub)}&foodScope=${foodScope}` as const
  }
  return `/api/collection-items?main=${main}&sub=${encodeURIComponent(sub)}` as const
}

export function collectionProductsKey(sub: CollectionSubKey, foodScope: FoodScopeKey) {
  return `/api/collection-products?sub=${encodeURIComponent(sub)}&foodScope=${foodScope}` as const
}

export const allCollectionItemsKey = '/api/collection-items?scope=all' as const
export const allCollectionProductsKey = '/api/collection-products?scope=all' as const
export const regularFoodItemsKey = '/api/collection-items?scope=food-regular' as const

async function collectionItemsFetcher(url: string): Promise<CollectionItem[]> {
  return swrJsonFetch<CollectionItem[]>(url, '쇼핑 목록을 불러오지 못했습니다.')
}

async function collectionProductsFetcher(url: string): Promise<CollectionProduct[]> {
  return swrJsonFetch<CollectionProduct[]>(url, '쇼핑 목록을 불러오지 못했습니다.')
}

export function useCollectionItems(
  main: CollectionMainKey,
  sub: CollectionSubKey,
  foodScope?: FoodScopeKey,
) {
  const key = main === 'food' && foodScope ? collectionItemsKey(main, sub, foodScope) : collectionItemsKey(main, sub)
  const swr = useSWR<CollectionItem[]>(key, collectionItemsFetcher)

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}

export function useCollectionProducts(sub: CollectionSubKey, foodScope: FoodScopeKey, enabled = true) {
  const key = enabled ? collectionProductsKey(sub, foodScope) : null
  const swr = useSWR<CollectionProduct[]>(key, collectionProductsFetcher)

  return {
    products: swr.data ?? [],
    isLoading: enabled && swr.isLoading && !swr.data,
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

export function useAllCollectionProducts(enabled: boolean) {
  const swr = useSWR<CollectionProduct[]>(
    enabled ? allCollectionProductsKey : null,
    collectionProductsFetcher,
  )

  return {
    products: swr.data ?? [],
    isLoading: enabled && swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}

export function useRegularFoodItems(enabled: boolean) {
  const swr = useSWR<CollectionItem[]>(enabled ? regularFoodItemsKey : null, collectionItemsFetcher)

  return {
    items: swr.data ?? [],
    isLoading: enabled && swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}
