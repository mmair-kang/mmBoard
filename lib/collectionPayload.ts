// 수정: Auto — 2026-06-05 (푸드 필드)

import type { CollectionMainKey, CollectionSubKey } from '@/config/collectionCategories'
import {
  COLLECTION_STORES,
  isFashionMainCategory,
  isFoodMainCategory,
  isValidCollectionPair,
  type CollectionStoreKey,
} from '@/config/collectionCategories'
import {
  AMOUNT_UNITS,
  PACK_TYPES,
  type AmountUnit,
  type PackType,
} from '@/config/shoppingCategories'
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
  model: string
  size: string
  description: string
  purchasePrice: number
  storeKey: CollectionStoreKey
  storeCustom: string | null
  purchaseDate: string
  amount: number
  amountUnit: AmountUnit
  packType: PackType
  packCount: number
  unitsPerPack: number
  optionType: CollectionOptionType
  optionData: CollectionOptionData
  imageData: string | null
}

function trimOptional(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function defaultFoodFields(): Pick<
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

function parseFoodFields(
  mainKey: CollectionMainKey,
  body: Record<string, unknown>,
): Pick<
  CollectionItemPayload,
  'amount' | 'amountUnit' | 'packType' | 'packCount' | 'unitsPerPack'
> | null {
  if (!isFoodMainCategory(mainKey)) return defaultFoodFields()

  const amount = Number(body.amount)
  const amountUnit = body.amountUnit
  const packType = String(body.packType ?? 'piece')
  const packCountRaw = Number(body.packCount ?? 1)
  const unitsPerPackRaw = Number(body.unitsPerPack ?? 1)

  if (!Number.isFinite(amount) || amount <= 0) return null
  if (!amountUnitSet.has(String(amountUnit))) return null
  if (!packTypeKeys.has(packType)) return null
  if (!Number.isFinite(packCountRaw) || packCountRaw < 1) return null
  const packCount = Math.round(packCountRaw)
  if (packCount < 1) return null

  const typedPackType = packType as PackType
  let unitsPerPack = 1
  if (typedPackType === 'box') {
    if (!Number.isFinite(unitsPerPackRaw) || unitsPerPackRaw < 1) return null
    unitsPerPack = Math.round(unitsPerPackRaw)
    if (unitsPerPack < 1) return null
  }

  return {
    amount,
    amountUnit: amountUnit as AmountUnit,
    packType: typedPackType,
    packCount,
    unitsPerPack,
  }
}

export function parseCollectionItemPayload(body: Record<string, unknown>): CollectionItemPayload | null {
  const mainCategory = body.mainCategory
  const subCategory = body.subCategory
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const purchasePrice = Number(body.purchasePrice)
  const storeKey = body.storeKey
  const storeCustom = trimOptional(body.storeCustom)
  const optionTypeRaw = body.optionType ?? 'none'

  if (!isValidCollectionPair(mainCategory, subCategory)) return null
  if (!name) return null
  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) return null
  if (!storeKeys.has(String(storeKey))) return null
  if (!isValidCollectionOptionType(optionTypeRaw)) return null

  const mainKey = mainCategory as CollectionMainKey
  const foodFields = parseFoodFields(mainKey, body)
  if (!foodFields) return null

  const optionType = isFashionMainCategory(mainKey) ? optionTypeRaw : 'none'
  const optionData = parseCollectionOptionData(optionType, body.optionData)
  if (optionData === null) return null

  const purchaseDate = parseLastPurchaseDate(body.purchaseDate)
  if (!purchaseDate) return null

  if (!('imageData' in body)) return null
  const imageData = parseShoppingImageData(body.imageData)
  if (body.imageData !== null && body.imageData !== '' && imageData === null) return null

  return {
    mainCategory: mainKey,
    subCategory: subCategory as CollectionSubKey,
    brand: trimOptional(body.brand),
    name,
    model: trimOptional(body.model),
    size: trimOptional(body.size),
    description: trimOptional(body.description),
    purchasePrice: Math.round(purchasePrice),
    storeKey: storeKey as CollectionStoreKey,
    storeCustom: storeKey === 'custom' ? storeCustom || null : null,
    purchaseDate,
    ...foodFields,
    optionType,
    optionData,
    imageData,
  }
}

export function collectionOptionDataForDb(data: CollectionOptionData): string {
  return serializeCollectionOptionData(data)
}
