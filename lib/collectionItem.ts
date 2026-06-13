// 수정: Auto — 2026-06-05 (푸드 필드)

import {
  deserializeCollectionOptionData,
  emptyOptionData,
  isValidCollectionOptionType,
  readLegacyOptionSize,
  type CollectionOptionType,
} from '@/config/collectionOptions'
import {
  isFashionMainCategory,
  isValidFoodScope,
  normalizeCollectionMainSub,
  type CollectionMainKey,
  type FoodScopeKey,
  type CollectionSubKey,
} from '@/config/collectionCategories'
import type { CollectionStoreKey } from '@/config/collectionCategories'
import type { CollectionAmountUnit, PackType } from '@/config/shoppingCategories'
import { COLLECTION_AMOUNT_UNIT_NONE } from '@/config/shoppingCategories'
import { normalizePackType } from '@/config/shoppingCategories'
import type { collectionItems } from '@/lib/schema'

type CollectionRow = typeof collectionItems.$inferSelect

export type CollectionItemDto = {
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
  optionData: ReturnType<typeof deserializeCollectionOptionData>
  imageData: string | null
  repurchaseDays: number | null
  repurchaseActive: boolean
  foodScope: FoodScopeKey
  createdAt: string
}

export function sortCollectionItemsByPurchaseDate<T extends { purchaseDate: string; createdAt: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const byPurchaseDate = b.purchaseDate.localeCompare(a.purchaseDate)
    if (byPurchaseDate !== 0) return byPurchaseDate
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export function upsertCollectionItemSorted<T extends CollectionItemDto & { id: number }>(
  items: T[] | undefined,
  item: T,
): T[] {
  const list = (items ?? []).filter((row) => row.id !== item.id)
  return sortCollectionItemsByPurchaseDate([...list, item])
}

export function toCollectionItemDto(row: CollectionRow): CollectionItemDto {
  const normalized = normalizeCollectionMainSub(row.mainCategory, row.subCategory)
  const mainCategory = normalized.main
  const subCategory = normalized.sub as CollectionSubKey

  let optionType: CollectionOptionType = isValidCollectionOptionType(row.optionType ?? 'none')
    ? (row.optionType as CollectionOptionType)
    : 'none'
  let optionData = deserializeCollectionOptionData(row.optionData)

  if (!isFashionMainCategory(mainCategory)) {
    optionType = 'none'
    optionData = emptyOptionData('none')
  }

  const sizeFromColumn = (row.size ?? '').trim()
  const size = sizeFromColumn || readLegacyOptionSize(row.optionData)

  return {
    id: row.id,
    mainCategory,
    subCategory,
    brand: row.brand ?? '',
    name: row.name,
    nameSuffix: row.nameSuffix ?? '',
    model: row.model ?? '',
    size,
    description: row.description ?? '',
    purchasePrice: row.purchasePrice,
    storeKey: row.storeKey as CollectionStoreKey,
    storeCustom: row.storeCustom,
    purchaseDate: row.purchaseDate,
    amount: row.amount ?? 0,
    amountUnit: (row.amountUnit === COLLECTION_AMOUNT_UNIT_NONE
      ? COLLECTION_AMOUNT_UNIT_NONE
      : (row.amountUnit ?? 'g')) as CollectionAmountUnit,
    packType: normalizePackType(row.packType),
    packCount: row.packCount ?? 1,
    unitsPerPack: row.unitsPerPack ?? 1,
    optionType,
    optionData,
    imageData: row.imageData,
    repurchaseDays: row.repurchaseDays ?? null,
    repurchaseActive: (row.repurchaseActive ?? 0) === 1,
    foodScope:
      mainCategory === 'food' && isValidFoodScope(row.foodScope) ? row.foodScope : 'regular',
    createdAt: row.createdAt,
  }
}
