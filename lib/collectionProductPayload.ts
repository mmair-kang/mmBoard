// 수정: Auto — 2026-07-19 01:40 (빈 variants 허용)
// 수정: Auto — 2026-07-19 00:15 (product+variants payload)

import type { CollectionMainKey, CollectionSubEntry, CollectionSubKey, FoodScopeKey } from '@/config/collectionCategories'
import {
  isFoodMainCategory,
  isValidCollectionPair,
  isValidFoodScope,
} from '@/config/collectionCategories'
import { loadSubEntries } from '@/lib/collectionSubcategoryStore'
import {
  collectionOptionDataForDb,
  parseCollectionItemPayload,
  type CollectionItemPayload,
} from '@/lib/collectionPayload'
import {
  defaultFoodListChipFlags,
  parseFoodListChipFlags,
  type CollectionFoodListChipFlags,
} from '@/lib/collectionFoodListChips'

export type CollectionVariantPayload = Omit<CollectionItemPayload, 'name' | 'mainCategory' | 'subCategory' | 'foodScope'> & {
  id?: number
}

export type CollectionProductPayload = {
  name: string
  mainCategory: CollectionMainKey
  subCategory: CollectionSubKey
  foodScope: FoodScopeKey
  listChipFlags: CollectionFoodListChipFlags
  variants: CollectionVariantPayload[]
  selectedVariantIndex: number
}

export function parseCollectionProductPayload(
  body: Record<string, unknown>,
  subs?: CollectionSubEntry[],
): CollectionProductPayload | null {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return null

  const mainCategory = body.mainCategory
  const subCategory = body.subCategory
  if (!isValidCollectionPair(mainCategory, subCategory, subs)) return null
  const mainKey = mainCategory as CollectionMainKey
  if (!isFoodMainCategory(mainKey)) return null

  const foodScope: FoodScopeKey = isValidFoodScope(body.foodScope) ? body.foodScope : 'regular'

  // 항목명만 추가할 때 variants: [] 허용
  if (!('variants' in body)) return null
  if (!Array.isArray(body.variants)) return null

  const variants: CollectionVariantPayload[] = []
  for (const raw of body.variants) {
    if (!raw || typeof raw !== 'object') return null
    const row = raw as Record<string, unknown>
    const parsed = parseCollectionItemPayload(
      {
        ...row,
        mainCategory: mainKey,
        subCategory,
        name,
        foodScope,
      },
      subs,
    )
    if (!parsed) return null

    const idRaw = row.id
    const id = idRaw != null ? Math.round(Number(idRaw)) : undefined
    if (id != null && (!Number.isFinite(id) || id < 1)) return null

    variants.push({
      id,
      brand: parsed.brand,
      nameSuffix: parsed.nameSuffix,
      model: parsed.model,
      size: parsed.size,
      description: parsed.description,
      purchasePrice: parsed.purchasePrice,
      storeKey: parsed.storeKey,
      storeCustom: parsed.storeCustom,
      purchaseDate: parsed.purchaseDate,
      amount: parsed.amount,
      amountUnit: parsed.amountUnit,
      packType: parsed.packType,
      packCount: parsed.packCount,
      unitsPerPack: parsed.unitsPerPack,
      optionType: parsed.optionType,
      optionData: parsed.optionData,
      imageData: parsed.imageData,
      repurchaseDays: parsed.repurchaseDays,
      repurchaseActive: parsed.repurchaseActive,
      hidden: parsed.hidden,
    })
  }

  let selectedVariantIndex = 0
  if (variants.length === 0) {
    selectedVariantIndex = 0
  } else {
    const selectedRaw = Number(body.selectedVariantIndex ?? 0)
    if (!Number.isFinite(selectedRaw)) return null
    selectedVariantIndex = Math.round(selectedRaw)
    if (selectedVariantIndex < 0 || selectedVariantIndex >= variants.length) return null
  }

  return {
    name,
    mainCategory: mainKey,
    subCategory: subCategory as CollectionSubKey,
    foodScope,
    listChipFlags: parseFoodListChipFlags(body.listChipFlags ?? defaultFoodListChipFlags()),
    variants,
    selectedVariantIndex,
  }
}

export async function parseCollectionProductPayloadAsync(
  body: Record<string, unknown>,
): Promise<CollectionProductPayload | null> {
  const mainCategory = body.mainCategory
  if (typeof mainCategory !== 'string') return null
  const subs = await loadSubEntries(mainCategory as CollectionMainKey)
  return parseCollectionProductPayload(body, subs)
}

export { collectionOptionDataForDb }
