// 수정: Auto — 2026-06-11 (가격 칩 — 원 포함만 파란색)

import { hasCollectionAmount, isMultiUnitPackType } from '@/config/shoppingCategories'
import type { CollectionItem } from '@/hooks/useCollectionItems'
import {
  formatAmountWithPackCount,
  formatPerPiecePriceLabel,
  formatUnitPriceLabel,
  formatUnitsPerPackLabel,
  getTotalPieces,
} from '@/lib/shoppingUnitPrice'

function buildFoodLabels(item: CollectionItem, includeTotalCount: boolean): string[] {
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

  if (hasAmount) {
    push(formatAmountWithPackCount(item.amount, item.amountUnit, packType, packCount))
  }

  push(formatUnitsPerPackLabel(packType, unitsPerPack))

  if (includeTotalCount) {
    if (isMultiUnitPackType(packType) && packCount > 1) {
      push(`총 ${getTotalPieces(packType, packCount, unitsPerPack)}개`)
    } else if (packType === 'piece' && packCount > 1) {
      push(`총 ${packCount}개`)
    }
  }

  if (hasAmount) {
    push(formatUnitPriceLabel(item.purchasePrice, item.amount, item.amountUnit as 'g', packCount))
  }

  push(formatPerPiecePriceLabel(item.purchasePrice, packType, packCount, unitsPerPack))

  return parts
}

/** 목록용 — 총 N개 제외 */
export function getCollectionFoodListLabels(item: CollectionItem): string[] {
  return buildFoodLabels(item, false)
}

/** 상세용 — 전체 */
export function getCollectionFoodDetailLabels(item: CollectionItem): string[] {
  return buildFoodLabels(item, true)
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

export function formatCollectionFoodListSubline(item: CollectionItem): string {
  return getCollectionFoodListLabels(item).join(' · ')
}

export function formatCollectionPackListSubline(item: CollectionItem): string {
  return getCollectionPackDetailLabels(item).join(' · ')
}

/** 가격 단가 칩 — 100g당·1개당 등 (1박스당 N개 제외) */
export function isCollectionFoodPriceMetric(label: string): boolean {
  return label.includes('원')
}
