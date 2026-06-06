'use client'

import useSWR from 'swr'

import type { ShoppingCategoryKey, ShoppingStoreKey, AmountUnit, PackType } from '@/config/shoppingCategories'

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
  const res = await fetch(url)
  if (!res.ok) throw new Error('쇼핑 목록을 불러오지 못했습니다.')
  return res.json() as Promise<ShoppingItem[]>
}

export function useShoppingItems(category: ShoppingCategoryKey) {
  const key = shoppingItemsKey(category)
  const swr = useSWR<ShoppingItem[]>(key, shoppingItemsFetcher, {
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
