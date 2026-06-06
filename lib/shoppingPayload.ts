// 수정: Auto — 2026-06-05
import {
  AMOUNT_UNITS,
  PACK_TYPES,
  SHOPPING_CATEGORIES,
  SHOPPING_STORES,
  type AmountUnit,
  type PackType,
  type ShoppingCategoryKey,
  type ShoppingStoreKey,
} from '@/config/shoppingCategories'
import { parseLastPurchaseDate } from '@/lib/shoppingDate'
import { parseShoppingImageData } from '@/lib/shoppingImage'

const categoryKeys = new Set<string>(SHOPPING_CATEGORIES.map((c) => c.key))
const storeKeys = new Set<string>(SHOPPING_STORES.map((s) => s.key))
const amountUnitSet = new Set<string>(AMOUNT_UNITS)
const packTypeKeys = new Set<string>(PACK_TYPES.map((p) => p.key))

export type ShoppingItemPayload = {
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
  lastPurchaseDate: string
  imageData: string | null
}

export function parseShoppingItemPayload(body: Record<string, unknown>): ShoppingItemPayload | null {
  const category = body.category
  const brand = typeof body.brand === 'string' ? body.brand.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const price = Number(body.price)
  const amount = Number(body.amount)
  const amountUnit = body.amountUnit
  const packType = String(body.packType ?? 'piece')
  const packCountRaw = Number(body.packCount ?? 1)
  const unitsPerPackRaw = Number(body.unitsPerPack ?? 1)
  const storeKey = body.storeKey
  const storeCustom = typeof body.storeCustom === 'string' ? body.storeCustom.trim() : ''

  if (!categoryKeys.has(String(category))) return null
  if (!name) return null
  if (!Number.isFinite(price) || price < 0) return null
  if (!Number.isFinite(amount) || amount <= 0) return null
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

  if (!amountUnitSet.has(String(amountUnit))) return null
  if (!storeKeys.has(String(storeKey))) return null

  const lastPurchaseDate = parseLastPurchaseDate(body.lastPurchaseDate)
  if (!lastPurchaseDate) return null

  if (!('imageData' in body)) return null
  const imageData = parseShoppingImageData(body.imageData)
  if (body.imageData !== null && body.imageData !== '' && imageData === null) return null

  return {
    category: category as ShoppingCategoryKey,
    brand,
    name,
    price: Math.round(price),
    amount,
    amountUnit: amountUnit as AmountUnit,
    packType: typedPackType,
    packCount,
    unitsPerPack,
    storeKey: storeKey as ShoppingStoreKey,
    storeCustom: storeKey === 'custom' ? storeCustom || null : null,
    lastPurchaseDate,
    imageData,
  }
}
