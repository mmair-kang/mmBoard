'use client'
// 수정: Auto — 2026-06-08

import type { AmountUnit, PackType, ShoppingCategoryKey, ShoppingStoreKey } from '@/config/shoppingCategories'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export interface ShoppingItem {
  id: number
  category: ShoppingCategoryKey
  brand: string
  name: string
  price: number
  amount: number
  amountUnit: AmountUnit
  packType: PackType
  packCount: number
  unitsPerPack: number
  storeKey: ShoppingStoreKey
  storeCustom: string | null
  lastPurchaseDate: string | null
  imageData: string | null
  createdAt: string
}

export function shoppingItemsKey(category: ShoppingCategoryKey) {
  return `/api/shopping-items?category=${category}` as const
}

async function shoppingItemsFetcher(url: string): Promise<ShoppingItem[]> {
  return swrJsonFetch<ShoppingItem[]>(url, '쇼핑 목록을 불러오지 못했습니다.')
}

export function useShoppingItems(category: ShoppingCategoryKey) {
  const key = shoppingItemsKey(category)
  const swr = useSWR<ShoppingItem[]>(key, shoppingItemsFetcher)

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}
