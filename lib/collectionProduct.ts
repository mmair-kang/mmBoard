// 수정: Auto — 2026-07-19 02:45 (목록 칩 설정)
// 수정: Auto — 2026-07-19 01:35 (빈 제품·이름 중복)

import type { CollectionMainKey, CollectionSubKey, FoodScopeKey } from '@/config/collectionCategories'
import { isValidFoodScope, normalizeCollectionMainSub } from '@/config/collectionCategories'
import {
  sortCollectionItemsByPurchaseDate,
  toCollectionItemDto,
  type CollectionItemDto,
} from '@/lib/collectionItem'
import {
  defaultFoodListChipFlags,
  parseFoodListChipFlags,
  type CollectionFoodListChipFlags,
} from '@/lib/collectionFoodListChips'
import type { collectionProducts } from '@/lib/schema'

type ProductRow = typeof collectionProducts.$inferSelect

export type CollectionProductDto = {
  id: number
  name: string
  mainCategory: CollectionMainKey
  subCategory: CollectionSubKey
  foodScope: FoodScopeKey
  listChipFlags: CollectionFoodListChipFlags
  createdAt: string
  variants: CollectionItemDto[]
  selectedVariantId: number | null
}

export function toCollectionProductDto(
  product: ProductRow,
  variantRows: Parameters<typeof toCollectionItemDto>[0][],
): CollectionProductDto {
  const normalized = normalizeCollectionMainSub(product.mainCategory, product.subCategory)
  const variants = sortCollectionItemsByPurchaseDate(variantRows.map(toCollectionItemDto))
  const selected = variants.find((v) => v.isSelected) ?? variants[0] ?? null

  return {
    id: product.id,
    name: product.name,
    mainCategory: normalized.main,
    subCategory: normalized.sub as CollectionSubKey,
    foodScope: isValidFoodScope(product.foodScope) ? product.foodScope : 'regular',
    listChipFlags: parseFoodListChipFlags(
      'listChipFlags' in product ? product.listChipFlags : defaultFoodListChipFlags(),
    ),
    createdAt: product.createdAt,
    variants,
    selectedVariantId: selected?.id ?? null,
  }
}

export function getSelectedVariant(product: CollectionProductDto): CollectionItemDto | null {
  if (product.variants.length === 0) return null
  return product.variants.find((v) => v.id === product.selectedVariantId) ?? product.variants[0] ?? null
}

export function sortCollectionProductsBySelectedPurchase<T extends CollectionProductDto>(
  products: T[],
): T[] {
  return [...products].sort((a, b) => {
    const aSel = getSelectedVariant(a)
    const bSel = getSelectedVariant(b)
    if (!aSel && !bSel) return b.createdAt.localeCompare(a.createdAt)
    if (!aSel) return 1
    if (!bSel) return -1
    const byPurchase = bSel.purchaseDate.localeCompare(aSel.purchaseDate)
    if (byPurchase !== 0) return byPurchase
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export function upsertCollectionProductSorted<T extends CollectionProductDto>(
  products: T[] | undefined,
  product: T,
): T[] {
  const list = (products ?? []).filter((row) => row.id !== product.id)
  return sortCollectionProductsBySelectedPurchase([...list, product])
}

/** 목록 카드용 — 선택 변형이 없으면 null */
export function productToDisplayItem(product: CollectionProductDto): CollectionItemDto | null {
  const selected = getSelectedVariant(product)
  if (!selected) return null
  return {
    ...selected,
    name: product.name,
    productId: product.id,
    isSelected: true,
  }
}

/** 선택만 바꾸거나 폼 없이 PATCH할 때 사용 */
export function collectionProductToPayload(
  product: CollectionProductDto,
  selectedVariantId?: number | null,
): import('@/lib/collectionProductPayload').CollectionProductPayload {
  const targetId = selectedVariantId === undefined ? product.selectedVariantId : selectedVariantId
  let selectedVariantIndex = product.variants.findIndex((v) => v.id === targetId)
  if (selectedVariantIndex < 0) selectedVariantIndex = product.variants.length > 0 ? 0 : -1

  return {
    name: product.name,
    mainCategory: 'food',
    subCategory: product.subCategory,
    foodScope: product.foodScope,
    listChipFlags: product.listChipFlags ?? defaultFoodListChipFlags(),
    selectedVariantIndex: Math.max(0, selectedVariantIndex),
    variants: product.variants.map((v) => ({
      id: v.id,
      brand: v.brand,
      nameSuffix: v.nameSuffix,
      model: v.model,
      size: v.size,
      description: v.description,
      purchasePrice: v.purchasePrice,
      storeKey: v.storeKey,
      storeCustom: v.storeCustom,
      purchaseDate: v.purchaseDate,
      amount: v.amount,
      amountUnit: v.amountUnit,
      packType: v.packType,
      packCount: v.packCount,
      unitsPerPack: v.unitsPerPack,
      optionType: v.optionType,
      optionData: v.optionData,
      imageData: v.imageData,
      repurchaseDays: v.repurchaseDays,
      repurchaseActive: v.repurchaseActive,
      hidden: v.hidden,
    })),
  }
}
