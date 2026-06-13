// 수정: Auto — 2026-06-11 (상시·수시·소장)

import type { PackType } from '@/config/shoppingCategories'
import { SHOPPING_STORES } from '@/config/shoppingCategories'

/** 0depth — 상시 / 수시 / 소장 */
export const COLLECTION_SECTIONS = [
  { key: 'regular', label: '상시', color: '#f59e0b' },
  { key: 'occasional', label: '수시', color: '#14b8a6' },
  { key: 'own', label: '소장', color: '#6366f1' },
] as const

export type CollectionSectionKey = (typeof COLLECTION_SECTIONS)[number]['key']

/** food 항목 — 상시(늘 사는) / 수시(가끔 사는) */
export const FOOD_SCOPES = [
  { key: 'regular', label: '상시' },
  { key: 'occasional', label: '수시' },
] as const

export type FoodScopeKey = (typeof FOOD_SCOPES)[number]['key']

const foodScopeKeys = new Set<string>(FOOD_SCOPES.map((s) => s.key))

export function isValidFoodScope(value: unknown): value is FoodScopeKey {
  return foodScopeKeys.has(String(value))
}

export function getFoodScopeLabel(scope: FoodScopeKey): string {
  return FOOD_SCOPES.find((s) => s.key === scope)?.label ?? scope
}

export function isConsumableSection(section: CollectionSectionKey): section is 'regular' | 'occasional' {
  return section === 'regular' || section === 'occasional'
}

export const COLLECTION_MAIN_CATEGORIES = [
  { key: 'personal', label: '개인', color: '#f97316' },
  { key: 'home', label: '아파트', color: '#22c55e' },
  { key: 'car', label: '자동차', color: '#0ea5e9' },
  { key: 'food', label: '소모품', color: '#f59e0b' },
  { key: 'fashion', label: '패션', color: '#8b5cf6' },
] as const

export type CollectionMainKey = (typeof COLLECTION_MAIN_CATEGORIES)[number]['key']

const LIVING_MAIN: CollectionMainKey = 'food'
const OWN_MAINS = new Set<CollectionMainKey>(['personal', 'home', 'car', 'fashion'])

export const COLLECTION_OWN_MAIN_CATEGORIES = COLLECTION_MAIN_CATEGORIES.filter((c) =>
  OWN_MAINS.has(c.key),
)

export function getCollectionSectionMeta(key: CollectionSectionKey) {
  return COLLECTION_SECTIONS.find((c) => c.key === key)!
}

export function getCollectionSectionForMain(main: CollectionMainKey): CollectionSectionKey {
  return main === LIVING_MAIN ? 'regular' : 'own'
}

export function getCollectionSectionForItem(item: {
  mainCategory: CollectionMainKey
  foodScope: FoodScopeKey
}): CollectionSectionKey {
  if (item.mainCategory !== LIVING_MAIN) return 'own'
  return item.foodScope
}

export function getSectionMainCategories(section: CollectionSectionKey) {
  return isConsumableSection(section)
    ? COLLECTION_MAIN_CATEGORIES.filter((c) => c.key === LIVING_MAIN)
    : COLLECTION_OWN_MAIN_CATEGORIES
}

export function getDefaultMainForSection(section: CollectionSectionKey): CollectionMainKey {
  return isConsumableSection(section) ? 'food' : 'personal'
}

export function getDefaultFoodScopeForSection(section: CollectionSectionKey): FoodScopeKey {
  return section === 'occasional' ? 'occasional' : 'regular'
}

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

export type CollectionSubKey = string

export type CollectionSubFilterKey = CollectionSubKey | typeof COLLECTION_SUB_ALL

export type CollectionSubEntry = { key: string; label: string }

const mainKeys = new Set<string>(COLLECTION_MAIN_CATEGORIES.map((c) => c.key))

export function isFashionMainCategory(main: CollectionMainKey): boolean {
  return main === 'fashion'
}

export function isFoodMainCategory(main: CollectionMainKey): boolean {
  return main === 'food'
}

export function isCarMainCategory(main: CollectionMainKey): boolean {
  return main === 'car'
}

const COLLECTION_PACK_DETAIL_MAINS = new Set<CollectionMainKey>(['personal', 'home', 'car'])

/** 개인 · 아파트 · 자동차 — 상세옵션(없음/박스/묶음상품) */
export function isCollectionPackDetailCategory(main: CollectionMainKey): boolean {
  return COLLECTION_PACK_DETAIL_MAINS.has(main)
}

export const COLLECTION_DETAIL_PACK_OPTIONS = [
  { key: 'none', label: '없음' },
  { key: 'box', label: '박스' },
  { key: 'bundle', label: '묶음상품' },
] as const

export type CollectionDetailPackOptionKey = (typeof COLLECTION_DETAIL_PACK_OPTIONS)[number]['key']

export function toCollectionDetailOptionKey(packType: string): CollectionDetailPackOptionKey {
  if (packType === 'box') return 'box'
  if (packType === 'bundle') return 'bundle'
  return 'none'
}

export function packTypeFromCollectionDetailOption(key: string): PackType {
  if (key === 'box') return 'box'
  if (key === 'bundle') return 'bundle'
  return 'piece'
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

export function getCollectionSubcategories(main: CollectionMainKey, subs?: CollectionSubEntry[]) {
  return subs ?? COLLECTION_SUBCATEGORIES[main]
}

/** 2depth 목록 (전체 없음) */
export function getCollectionSubFilters(main: CollectionMainKey, subs?: CollectionSubEntry[]) {
  return getCollectionSubcategories(main, subs)
}

export function getDefaultSubcategory(main: CollectionMainKey, subs?: CollectionSubEntry[]): CollectionSubKey {
  return getFirstSubcategory(main, subs)
}

export function getFirstSubcategory(main: CollectionMainKey, subs?: CollectionSubEntry[]): CollectionSubKey {
  const list = getCollectionSubcategories(main, subs)
  return list[0]?.key ?? COLLECTION_SUBCATEGORIES[main][0].key
}

export function getSubcategoryLabel(
  main: CollectionMainKey,
  sub: CollectionSubKey,
  subs?: CollectionSubEntry[],
): string {
  const list = subs ?? COLLECTION_SUBCATEGORIES[main]
  return list.find((c) => c.key === sub)?.label ?? sub
}

export function getSubFilterLabel(
  main: CollectionMainKey,
  sub: CollectionSubFilterKey,
  subs?: CollectionSubEntry[],
): string {
  if (sub === COLLECTION_SUB_ALL) return '전체'
  return getSubcategoryLabel(main, sub, subs)
}

export function isValidSubFilter(
  main: unknown,
  sub: unknown,
  subs?: CollectionSubEntry[],
): main is CollectionMainKey {
  if (!mainKeys.has(String(main))) return false
  if (sub === COLLECTION_SUB_ALL) return true
  const mainKey = main as CollectionMainKey
  const list = subs ?? COLLECTION_SUBCATEGORIES[mainKey]
  return list.some((c) => c.key === sub)
}

export function isValidCollectionPair(
  main: unknown,
  sub: unknown,
  subs?: CollectionSubEntry[],
): main is CollectionMainKey {
  if (!mainKeys.has(String(main))) return false
  const mainKey = main as CollectionMainKey
  const list = subs ?? COLLECTION_SUBCATEGORIES[mainKey]
  return list.some((c) => c.key === sub)
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
