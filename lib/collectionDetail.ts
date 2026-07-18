// 수정: Auto — 2026-07-19 02:45 (목록 칩 필터)
// 수정: Auto — 2026-06-30 (패션 상세옵션 목록 메트릭)

import { isFashionMainCategory } from '@/config/collectionCategories'
import {
  COLLECTION_OPTION_FIELDS,
  type CollectionOptionFieldKey,
} from '@/config/collectionOptions'
import type { CollectionItem } from '@/hooks/useCollectionItems'
import {
  defaultFoodListChipFlags,
  type CollectionFoodListChipFlags,
} from '@/lib/collectionFoodListChips'
import { hasCollectionAmount, isMultiUnitPackType } from '@/config/shoppingCategories'
import {
  formatAmountWithPackCount,
  formatPerPiecePriceLabel,
  formatUnitPriceLabel,
  formatUnitsPerPackLabel,
  getTotalPieces,
} from '@/lib/shoppingUnitPrice'

function buildFoodLabels(
  item: CollectionItem,
  includeTotalCount: boolean,
  flags: CollectionFoodListChipFlags = defaultFoodListChipFlags(),
): string[] {
  const packType = item.packType === 'box' ? 'box' : item.packType === 'bundle' ? 'bundle' : 'piece'
  const packCount = item.packCount ?? 1
  const unitsPerPack = item.unitsPerPack ?? 1
  const hasAmount = hasCollectionAmount(item.amount, item.amountUnit)
  const parts: string[] = []
  const seen = new Set<string>()

  const push = (label: string | null | undefined) => {
    if (!label || seen.has(label)) return
    parts.push(label)
    seen.add(label)
  }

  if (flags.amount && hasAmount) {
    push(formatAmountWithPackCount(item.amount, item.amountUnit, packType, packCount))
  }

  if (flags.unitsPerPack) {
    push(formatUnitsPerPackLabel(packType, unitsPerPack))
  }

  if (includeTotalCount) {
    if (isMultiUnitPackType(packType) && packCount > 1) {
      push(`총 ${getTotalPieces(packType, packCount, unitsPerPack)}개`)
    } else if (packType === 'piece' && packCount > 1) {
      push(`총 ${packCount}개`)
    }
  }

  if (flags.unitPrice && hasAmount) {
    push(formatUnitPriceLabel(item.purchasePrice, item.amount, item.amountUnit as 'g', packCount))
  }

  if (flags.perPiece) {
    push(formatPerPiecePriceLabel(item.purchasePrice, packType, packCount, unitsPerPack))
  }

  return parts
}

/** 목록용 — 총 N개 제외 · 항목 칩 설정 반영 */
export function getCollectionFoodListLabels(
  item: CollectionItem,
  flags?: CollectionFoodListChipFlags,
): string[] {
  return buildFoodLabels(item, false, flags ?? defaultFoodListChipFlags())
}

/** 상세용 — 전체 (칩 필터 없음) */
export function getCollectionFoodDetailLabels(item: CollectionItem): string[] {
  return buildFoodLabels(item, true, defaultFoodListChipFlags())
}
/** 박스/묶음 상세옵션 — 1단위당 N개 · 1개당 가격 */
export function getCollectionPackDetailLabels(item: CollectionItem): string[] {
  const packType = item.packType
  if (packType !== 'box' && packType !== 'bundle') return []

  const packCount = item.packCount ?? 1
  const unitsPerPack = item.unitsPerPack ?? 1
  const parts: string[] = []

  const packLabel = formatUnitsPerPackLabel(packType, unitsPerPack)
  if (packLabel) parts.push(packLabel)

  const perPiece = formatPerPiecePriceLabel(item.purchasePrice, packType, packCount, unitsPerPack)
  if (perPiece) parts.push(perPiece)

  return parts
}

export function formatCollectionFoodListSubline(
  item: CollectionItem,
  flags?: CollectionFoodListChipFlags,
): string {
  return getCollectionFoodListLabels(item, flags).join(' · ')
}

export function formatCollectionPackListSubline(item: CollectionItem): string {
  return getCollectionPackDetailLabels(item).join(' · ')
}

export type CollectionFashionListMetric = {
  key: CollectionOptionFieldKey
  value: string
}

export function getCollectionFashionListMetrics(item: CollectionItem): CollectionFashionListMetric[] {
  if (!isFashionMainCategory(item.mainCategory) || item.optionType === 'none') return []

  return COLLECTION_OPTION_FIELDS[item.optionType]
    .map((field) => {
      const value = item.optionData[field.key]?.trim() ?? ''
      return value ? { key: field.key, value } : null
    })
    .filter((row): row is CollectionFashionListMetric => row != null)
}

export function hasCollectionFashionListDetail(item: CollectionItem): boolean {
  if (!isFashionMainCategory(item.mainCategory) || item.optionType === 'none') return false
  return Boolean(item.size.trim() || item.model.trim()) || getCollectionFashionListMetrics(item).length > 0
}

/** 가격 단가 칩 — 100g당·1개당 등 (1박스당 N개 제외) */
export function isCollectionFoodPriceMetric(label: string): boolean {
  return label.includes('원')
}
