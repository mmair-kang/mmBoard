// 수정: Auto — 2026-06-26 (재구매중 → 숨김 대체)

import type { CollectionMainKey, CollectionSubKey, CollectionSubEntry, FoodScopeKey } from '@/config/collectionCategories'
import {
  COLLECTION_STORES,
  isCollectionPackDetailCategory,
  isFashionMainCategory,
  isFoodMainCategory,
  isValidCollectionPair,
  isValidFoodScope,
  type CollectionStoreKey,
} from '@/config/collectionCategories'
import {
  AMOUNT_UNITS,
  PACK_TYPES,
  COLLECTION_AMOUNT_UNIT_NONE,
  isMultiUnitPackType,
  normalizePackType,
  type AmountUnit,
  type CollectionAmountUnit,
  type PackType,
} from '@/config/shoppingCategories'
import { loadSubEntries } from '@/lib/collectionSubcategoryStore'
import {
  isValidCollectionOptionType,
  parseCollectionOptionData,
  serializeCollectionOptionData,
  type CollectionOptionData,
  type CollectionOptionType,
} from '@/config/collectionOptions'
import { parseLastPurchaseDate } from '@/lib/shoppingDate'
import { parseShoppingImageData } from '@/lib/shoppingImage'

const storeKeys = new Set<string>(COLLECTION_STORES.map((s) => s.key))
const amountUnitSet = new Set<string>(AMOUNT_UNITS)
const packTypeKeys = new Set<string>(PACK_TYPES.map((p) => p.key))

export type CollectionItemPayload = {
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
}

function trimOptional(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function defaultPackFields(): Pick<
  CollectionItemPayload,
  'amount' | 'amountUnit' | 'packType' | 'packCount' | 'unitsPerPack'
> {
  return {
    amount: 0,
    amountUnit: 'g',
    packType: 'piece',
    packCount: 1,
    unitsPerPack: 1,
  }
}

function parseCollectionPackDetailFields(
  mainKey: CollectionMainKey,
  body: Record<string, unknown>,
): Pick<
  CollectionItemPayload,
  'amount' | 'amountUnit' | 'packType' | 'packCount' | 'unitsPerPack'
> | null {
  if (!isCollectionPackDetailCategory(mainKey)) return null

  const packType = normalizePackType(String(body.packType ?? 'piece'))
  if (!isMultiUnitPackType(packType)) return defaultPackFields()

  const unitsPerPackRaw = Number(body.unitsPerPack ?? 1)
  if (!Number.isFinite(unitsPerPackRaw) || unitsPerPackRaw < 1) return null
  const unitsPerPack = Math.round(unitsPerPackRaw)
  if (unitsPerPack < 1) return null

  return {
    ...defaultPackFields(),
    packType,
    packCount: 1,
    unitsPerPack,
  }
}

function parseFoodFields(
  mainKey: CollectionMainKey,
  body: Record<string, unknown>,
): Pick<
  CollectionItemPayload,
  'amount' | 'amountUnit' | 'packType' | 'packCount' | 'unitsPerPack'
> | null {
  if (!isFoodMainCategory(mainKey)) return null

  const amountUnitRaw = String(body.amountUnit ?? COLLECTION_AMOUNT_UNIT_NONE)
  const packType = String(body.packType ?? 'piece')
  const packCountRaw = Number(body.packCount ?? 1)
  const unitsPerPackRaw = Number(body.unitsPerPack ?? 1)

  if (!packTypeKeys.has(packType)) return null
  if (!Number.isFinite(packCountRaw) || packCountRaw < 1) return null
  const packCount = Math.round(packCountRaw)
  if (packCount < 1) return null

  const typedPackType = packType as PackType
  let unitsPerPack = 1
  if (isMultiUnitPackType(typedPackType)) {
    if (!Number.isFinite(unitsPerPackRaw) || unitsPerPackRaw < 1) return null
    unitsPerPack = Math.round(unitsPerPackRaw)
    if (unitsPerPack < 1) return null
  }

  if (amountUnitRaw === COLLECTION_AMOUNT_UNIT_NONE) {
    return {
      amount: 0,
      amountUnit: COLLECTION_AMOUNT_UNIT_NONE,
      packType: typedPackType,
      packCount,
      unitsPerPack,
    }
  }

  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (!amountUnitSet.has(amountUnitRaw)) return null

  return {
    amount,
    amountUnit: amountUnitRaw as AmountUnit,
    packType: typedPackType,
    packCount,
    unitsPerPack,
  }
}

export function parseCollectionItemPayload(
  body: Record<string, unknown>,
  subs?: CollectionSubEntry[],
): CollectionItemPayload | null {
  const mainCategory = body.mainCategory
  const subCategory = body.subCategory
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const purchasePrice = Number(body.purchasePrice)
  const storeKey = body.storeKey
  const storeCustom = trimOptional(body.storeCustom)
  const optionTypeRaw = body.optionType ?? 'none'

  if (!isValidCollectionPair(mainCategory, subCategory, subs)) return null
  if (!name) return null
  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) return null
  if (!storeKeys.has(String(storeKey))) return null
  if (!isValidCollectionOptionType(optionTypeRaw)) return null

  const mainKey = mainCategory as CollectionMainKey
  const foodFields = parseFoodFields(mainKey, body)
  const packDetailFields = parseCollectionPackDetailFields(mainKey, body)
  const packFields = foodFields ?? packDetailFields ?? defaultPackFields()
  if (isFoodMainCategory(mainKey) && !foodFields) return null
  if (
    isCollectionPackDetailCategory(mainKey) &&
    isMultiUnitPackType(String(body.packType ?? '')) &&
    !packDetailFields
  ) {
    return null
  }

  const optionType = isFashionMainCategory(mainKey) ? optionTypeRaw : 'none'
  const optionData = parseCollectionOptionData(optionType, body.optionData)
  if (optionData === null) return null

  const purchaseDate = parseLastPurchaseDate(body.purchaseDate)
  if (!purchaseDate) return null

  if (!('imageData' in body)) return null
  const imageData = parseShoppingImageData(body.imageData)
  if (body.imageData !== null && body.imageData !== '' && imageData === null) return null

  let repurchaseDays: number | null = null
  let repurchaseActive = false
  let foodScope: FoodScopeKey = 'regular'
  if (isFoodMainCategory(mainKey)) {
    const raw = Number(body.repurchaseDays)
    if (!Number.isFinite(raw) || raw < 1) return null
    repurchaseDays = Math.round(raw)
    const hidden = Boolean(body.hidden)
    repurchaseActive = !hidden
    foodScope = isValidFoodScope(body.foodScope) ? body.foodScope : 'regular'
  }

  return {
    mainCategory: mainKey,
    subCategory: subCategory as CollectionSubKey,
    brand: trimOptional(body.brand),
    name,
    nameSuffix: trimOptional(body.nameSuffix),
    model: trimOptional(body.model),
    size: trimOptional(body.size),
    description: trimOptional(body.description),
    purchasePrice: Math.round(purchasePrice),
    storeKey: storeKey as CollectionStoreKey,
    storeCustom: storeKey === 'custom' ? storeCustom || null : null,
    purchaseDate,
    ...packFields,
    optionType,
    optionData,
    imageData,
    repurchaseDays,
    repurchaseActive,
    foodScope,
    hidden: Boolean(body.hidden),
  }
}

export async function parseCollectionItemPayloadAsync(
  body: Record<string, unknown>,
): Promise<CollectionItemPayload | null> {
  const mainCategory = body.mainCategory
  if (typeof mainCategory !== 'string') return null
  const subs = await loadSubEntries(mainCategory as CollectionMainKey)
  return parseCollectionItemPayload(body, subs)
}

export function collectionOptionDataForDb(data: CollectionOptionData): string {
  return serializeCollectionOptionData(data)
}
