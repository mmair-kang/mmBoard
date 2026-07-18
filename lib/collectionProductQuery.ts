// 수정: Auto — 2026-07-19 01:40 (이름 중복·빈 변형)
// 수정: Auto — 2026-07-19 00:15 (product 조회·저장)

import { and, asc, desc, eq, inArray, ne } from 'drizzle-orm'

import type { CollectionSubKey, FoodScopeKey } from '@/config/collectionCategories'
import { collectionOptionDataForDb } from '@/lib/collectionPayload'
import {
  sortCollectionProductsBySelectedPurchase,
  toCollectionProductDto,
  type CollectionProductDto,
} from '@/lib/collectionProduct'
import type { CollectionProductPayload, CollectionVariantPayload } from '@/lib/collectionProductPayload'
import { foodListChipFlagsForDb } from '@/lib/collectionFoodListChips'
import { db } from '@/lib/db'
import { collectionItems, collectionProducts } from '@/lib/schema'

export class DuplicateProductNameError extends Error {
  constructor() {
    super('같은 이름의 항목이 이미 있습니다.')
    this.name = 'DuplicateProductNameError'
  }
}

async function assertUniqueProductName(params: {
  name: string
  subCategory: CollectionSubKey
  foodScope: FoodScopeKey
  excludeId?: number
}) {
  const conditions = [
    eq(collectionProducts.mainCategory, 'food'),
    eq(collectionProducts.subCategory, params.subCategory),
    eq(collectionProducts.foodScope, params.foodScope),
    eq(collectionProducts.name, params.name.trim()),
  ]
  if (params.excludeId != null) {
    conditions.push(ne(collectionProducts.id, params.excludeId))
  }
  const rows = await db
    .select({ id: collectionProducts.id })
    .from(collectionProducts)
    .where(and(...conditions))
    .limit(1)
  if (rows[0]) throw new DuplicateProductNameError()
}

function variantValues(
  productId: number,
  product: CollectionProductPayload,
  variant: CollectionVariantPayload,
  isSelected: boolean,
  createdAt: string,
) {
  return {
    mainCategory: product.mainCategory,
    subCategory: product.subCategory,
    brand: variant.brand,
    name: product.name,
    nameSuffix: variant.nameSuffix,
    model: variant.model,
    size: variant.size,
    description: variant.description,
    purchasePrice: variant.purchasePrice,
    storeKey: variant.storeKey,
    storeCustom: variant.storeCustom,
    purchaseDate: variant.purchaseDate,
    amount: variant.amount,
    amountUnit: variant.amountUnit,
    packType: variant.packType,
    packCount: variant.packCount,
    unitsPerPack: variant.unitsPerPack,
    optionType: variant.optionType,
    optionData: collectionOptionDataForDb(variant.optionData),
    imageData: variant.imageData,
    repurchaseDays: variant.repurchaseDays,
    repurchaseActive: variant.repurchaseActive ? 1 : 0,
    foodScope: product.foodScope,
    hidden: variant.hidden ? 1 : 0,
    productId,
    isSelected: isSelected ? 1 : 0,
    createdAt,
  }
}

export async function loadProductDto(productId: number): Promise<CollectionProductDto | null> {
  const products = await db
    .select()
    .from(collectionProducts)
    .where(eq(collectionProducts.id, productId))
    .limit(1)
  const product = products[0]
  if (!product) return null

  const variants = await db
    .select()
    .from(collectionItems)
    .where(eq(collectionItems.productId, productId))
    .orderBy(desc(collectionItems.purchaseDate), asc(collectionItems.id))

  return toCollectionProductDto(product, variants)
}

export async function listProducts(params: {
  sub: CollectionSubKey
  foodScope: FoodScopeKey
}): Promise<CollectionProductDto[]> {
  const products = await db
    .select()
    .from(collectionProducts)
    .where(
      and(
        eq(collectionProducts.mainCategory, 'food'),
        eq(collectionProducts.subCategory, params.sub),
        eq(collectionProducts.foodScope, params.foodScope),
      ),
    )
    .orderBy(desc(collectionProducts.createdAt))

  if (products.length === 0) return []

  const productIds = products.map((p) => p.id)
  const variants = await db
    .select()
    .from(collectionItems)
    .where(inArray(collectionItems.productId, productIds))
    .orderBy(desc(collectionItems.purchaseDate), asc(collectionItems.id))

  const byProduct = new Map<number, typeof variants>()
  for (const row of variants) {
    if (row.productId == null) continue
    const list = byProduct.get(row.productId) ?? []
    list.push(row)
    byProduct.set(row.productId, list)
  }

  const dtos: CollectionProductDto[] = []
  for (const product of products) {
    const dto = toCollectionProductDto(product, byProduct.get(product.id) ?? [])
    if (dto) dtos.push(dto)
  }
  return sortCollectionProductsBySelectedPurchase(dtos)
}

export async function listAllFoodProducts(): Promise<CollectionProductDto[]> {
  const products = await db
    .select()
    .from(collectionProducts)
    .where(eq(collectionProducts.mainCategory, 'food'))
    .orderBy(desc(collectionProducts.createdAt))

  if (products.length === 0) return []

  const productIds = products.map((p) => p.id)
  const variants = await db
    .select()
    .from(collectionItems)
    .where(inArray(collectionItems.productId, productIds))
    .orderBy(desc(collectionItems.purchaseDate), asc(collectionItems.id))

  const byProduct = new Map<number, typeof variants>()
  for (const row of variants) {
    if (row.productId == null) continue
    const list = byProduct.get(row.productId) ?? []
    list.push(row)
    byProduct.set(row.productId, list)
  }

  const dtos: CollectionProductDto[] = []
  for (const product of products) {
    const dto = toCollectionProductDto(product, byProduct.get(product.id) ?? [])
    if (dto) dtos.push(dto)
  }
  return sortCollectionProductsBySelectedPurchase(dtos)
}

export async function createProduct(payload: CollectionProductPayload): Promise<CollectionProductDto> {
  await assertUniqueProductName({
    name: payload.name,
    subCategory: payload.subCategory,
    foodScope: payload.foodScope,
  })

  const now = new Date().toISOString()
  const inserted = await db
    .insert(collectionProducts)
    .values({
      name: payload.name,
      mainCategory: payload.mainCategory,
      subCategory: payload.subCategory,
      foodScope: payload.foodScope,
      listChipFlags: foodListChipFlagsForDb(payload.listChipFlags),
      createdAt: now,
    })
    .returning()
  const product = inserted[0]
  if (!product) throw new Error('product insert failed')

  for (let i = 0; i < payload.variants.length; i++) {
    const variant = payload.variants[i]
    await db.insert(collectionItems).values(
      variantValues(
        product.id,
        payload,
        variant,
        payload.variants.length > 0 && i === payload.selectedVariantIndex,
        now,
      ),
    )
  }

  const dto = await loadProductDto(product.id)
  if (!dto) throw new Error('product load failed')
  return dto
}

export async function updateProduct(
  productId: number,
  payload: CollectionProductPayload,
): Promise<CollectionProductDto | null> {
  const existing = await db
    .select()
    .from(collectionProducts)
    .where(eq(collectionProducts.id, productId))
    .limit(1)
  if (!existing[0]) return null

  await assertUniqueProductName({
    name: payload.name,
    subCategory: payload.subCategory,
    foodScope: payload.foodScope,
    excludeId: productId,
  })

  await db
    .update(collectionProducts)
    .set({
      name: payload.name,
      mainCategory: payload.mainCategory,
      subCategory: payload.subCategory,
      foodScope: payload.foodScope,
      listChipFlags: foodListChipFlagsForDb(payload.listChipFlags),
    })
    .where(eq(collectionProducts.id, productId))

  const existingVariants = await db
    .select()
    .from(collectionItems)
    .where(eq(collectionItems.productId, productId))

  const keepIds = new Set<number>()
  const now = new Date().toISOString()

  for (let i = 0; i < payload.variants.length; i++) {
    const variant = payload.variants[i]
    const isSelected = i === payload.selectedVariantIndex
    if (variant.id && existingVariants.some((row) => row.id === variant.id)) {
      keepIds.add(variant.id)
      await db
        .update(collectionItems)
        .set({
          ...variantValues(productId, payload, variant, isSelected, now),
          createdAt: existingVariants.find((row) => row.id === variant.id)?.createdAt ?? now,
        })
        .where(eq(collectionItems.id, variant.id))
      continue
    }

    await db
      .insert(collectionItems)
      .values(variantValues(productId, payload, variant, isSelected, now))
  }

  for (const row of existingVariants) {
    if (!keepIds.has(row.id)) {
      await db.delete(collectionItems).where(eq(collectionItems.id, row.id))
    }
  }

  return loadProductDto(productId)
}

export async function deleteProduct(productId: number): Promise<boolean> {
  const existing = await db
    .select({ id: collectionProducts.id })
    .from(collectionProducts)
    .where(eq(collectionProducts.id, productId))
    .limit(1)
  if (!existing[0]) return false

  await db.delete(collectionItems).where(eq(collectionItems.productId, productId))
  await db.delete(collectionProducts).where(eq(collectionProducts.id, productId))
  return true
}
