// 수정: Auto — 2026-06-05 (푸드 2depth: 음식·간식·건강)

import { SHOPPING_STORES } from '@/config/shoppingCategories'

export const COLLECTION_MAIN_CATEGORIES = [
  { key: 'personal', label: '개인', color: '#f97316' },
  { key: 'home', label: '아파트', color: '#22c55e' },
  { key: 'car', label: '자동차', color: '#0ea5e9' },
  { key: 'food', label: '푸드', color: '#f59e0b' },
  { key: 'fashion', label: '패션', color: '#8b5cf6' },
] as const

export type CollectionMainKey = (typeof COLLECTION_MAIN_CATEGORIES)[number]['key']

export const COLLECTION_SUB_ALL = 'all' as const

const LEGACY_PERSONAL_FASHION_SUBS = new Set([
  'short_sleeve',
  'long_sleeve',
  'outer',
  'pants',
  'shorts',
  'shoes',
  'underwear',
])

export const COLLECTION_SUBCATEGORIES = {
  personal: [{ key: 'appliance', label: '가전' }],
  home: [
    { key: 'living_room', label: '거실' },
    { key: 'kitchen', label: '주방' },
    { key: 'master_bedroom', label: '큰방' },
    { key: 'small_bedroom', label: '작은방' },
    { key: 'bathroom', label: '욕실' },
    { key: 'balcony', label: '발코니' },
  ],
  car: [
    { key: 'car_accessories', label: '차량용품' },
    { key: 'delivery', label: '배달' },
  ],
  food: [
    { key: 'food', label: '음식' },
    { key: 'snack', label: '간식' },
    { key: 'health', label: '건강' },
  ],
  fashion: [
    { key: 'short_sleeve', label: '반팔' },
    { key: 'long_sleeve', label: '긴팔' },
    { key: 'outer', label: '아우터' },
    { key: 'pants', label: '바지' },
    { key: 'shorts', label: '반바지' },
    { key: 'shoes', label: '신발' },
    { key: 'underwear', label: '속옷' },
  ],
} as const satisfies Record<CollectionMainKey, readonly { key: string; label: string }[]>

export type CollectionSubKey = {
  [K in CollectionMainKey]: (typeof COLLECTION_SUBCATEGORIES)[K][number]['key']
}[CollectionMainKey]

export type CollectionSubFilterKey = CollectionSubKey | typeof COLLECTION_SUB_ALL

const mainKeys = new Set<string>(COLLECTION_MAIN_CATEGORIES.map((c) => c.key))

export function isFashionMainCategory(main: CollectionMainKey): boolean {
  return main === 'fashion'
}

export function isFoodMainCategory(main: CollectionMainKey): boolean {
  return main === 'food'
}

/** DB에 personal + 패션 소분류로 남아 있는 레거시 데이터 보정 */
export function normalizeCollectionMainSub(
  main: string,
  sub: string,
): { main: CollectionMainKey; sub: string } {
  if (main === 'personal' && LEGACY_PERSONAL_FASHION_SUBS.has(sub)) {
    return { main: 'fashion', sub }
  }
  if (main === 'snack' || main === 'health') {
    return { main: 'food', sub: main }
  }
  return { main: main as CollectionMainKey, sub }
}

export function getCollectionMainMeta(key: CollectionMainKey) {
  return COLLECTION_MAIN_CATEGORIES.find((c) => c.key === key)!
}

export function getCollectionSubcategories(main: CollectionMainKey) {
  return COLLECTION_SUBCATEGORIES[main]
}

/** 2depth 목록 (전체 없음) */
export function getCollectionSubFilters(main: CollectionMainKey) {
  return COLLECTION_SUBCATEGORIES[main]
}

export function getDefaultSubcategory(main: CollectionMainKey): CollectionSubKey {
  return getFirstSubcategory(main)
}

export function getFirstSubcategory(main: CollectionMainKey): CollectionSubKey {
  return COLLECTION_SUBCATEGORIES[main][0].key as CollectionSubKey
}

export function getSubcategoryLabel(main: CollectionMainKey, sub: CollectionSubKey): string {
  return COLLECTION_SUBCATEGORIES[main].find((c) => c.key === sub)?.label ?? sub
}

export function getSubFilterLabel(main: CollectionMainKey, sub: CollectionSubFilterKey): string {
  if (sub === COLLECTION_SUB_ALL) return '전체'
  return getSubcategoryLabel(main, sub)
}

export function isValidSubFilter(main: unknown, sub: unknown): main is CollectionMainKey {
  if (!mainKeys.has(String(main))) return false
  if (sub === COLLECTION_SUB_ALL) return true
  const mainKey = main as CollectionMainKey
  return COLLECTION_SUBCATEGORIES[mainKey].some((c) => c.key === sub)
}

export function isValidCollectionPair(main: unknown, sub: unknown): main is CollectionMainKey {
  if (!mainKeys.has(String(main))) return false
  const mainKey = main as CollectionMainKey
  return COLLECTION_SUBCATEGORIES[mainKey].some((c) => c.key === sub)
}

/** 소장 전용 구매처 — 쇼핑 목록 + 맨 아래 오프라인 */
export const COLLECTION_STORES = [
  ...SHOPPING_STORES.filter((s) => s.key !== 'custom'),
  { key: 'custom', label: '직접 입력' },
  { key: 'offline', label: '오프라인' },
] as const

export type CollectionStoreKey = (typeof COLLECTION_STORES)[number]['key']

export function getCollectionStoreLabel(storeKey: CollectionStoreKey, customStore?: string | null) {
  if (storeKey === 'custom') return customStore?.trim() || '직접 입력'
  return COLLECTION_STORES.find((s) => s.key === storeKey)?.label ?? storeKey
}
