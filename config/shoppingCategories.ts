export const SHOPPING_CATEGORIES = [
  { key: 'snack', label: '간식', color: '#f59e0b' },
  { key: 'health', label: '건강', color: '#22c55e' },
  { key: 'food', label: '음식', color: '#2563eb' },
] as const

export type ShoppingCategoryKey = (typeof SHOPPING_CATEGORIES)[number]['key']

export const SHOPPING_STORES = [
  { key: 'coupang', label: '쿠팡' },
  { key: 'naver', label: '네이버' },
  { key: 'kurly', label: '컬리' },
  { key: 'gmarket', label: 'G마켓' },
  { key: 'auction', label: '옥션' },
  { key: 'todayhouse', label: '오늘의집' },
  { key: 'custom', label: '직접 입력' },
] as const

export type ShoppingStoreKey = (typeof SHOPPING_STORES)[number]['key']

export const AMOUNT_UNITS = ['mg', 'g', 'kg', 'ml'] as const

export type AmountUnit = (typeof AMOUNT_UNITS)[number]

/** 소모(food) 용량 — 없음 선택 시 amount 0 */
export const COLLECTION_AMOUNT_UNIT_NONE = 'none' as const

export type CollectionAmountUnit = AmountUnit | typeof COLLECTION_AMOUNT_UNIT_NONE

export const COLLECTION_AMOUNT_UNIT_OPTIONS = [
  { key: COLLECTION_AMOUNT_UNIT_NONE, label: '없음' },
  ...AMOUNT_UNITS.map((unit) => ({ key: unit, label: unit })),
] as const

export function hasCollectionAmount(amount: number, unit: string): boolean {
  return unit !== COLLECTION_AMOUNT_UNIT_NONE && amount > 0
}

/** 구매 단위 — 낱개(개) 또는 박스 */
export const PACK_TYPES = [
  { key: 'piece', label: '개' },
  { key: 'box', label: '박스' },
] as const

export type PackType = (typeof PACK_TYPES)[number]['key'] | 'bundle'

export function isMultiUnitPackType(packType: PackType | string | undefined): boolean {
  return packType === 'box' || packType === 'bundle'
}

export function normalizePackType(packType: string | null | undefined): PackType {
  if (packType === 'box') return 'box'
  if (packType === 'bundle') return 'bundle'
  return 'piece'
}

export function getPackTypeLabel(packType: PackType | string) {
  if (packType === 'bundle') return '묶음상품'
  return PACK_TYPES.find((p) => p.key === packType)?.label ?? packType
}

export function getCategoryMeta(key: ShoppingCategoryKey) {
  return SHOPPING_CATEGORIES.find((c) => c.key === key)!
}

export function getStoreLabel(storeKey: ShoppingStoreKey, customStore?: string | null) {
  if (storeKey === 'custom') return customStore?.trim() || '직접 입력'
  return SHOPPING_STORES.find((s) => s.key === storeKey)?.label ?? storeKey
}
