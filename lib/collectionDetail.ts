// 수정: Auto — 2026-06-05 (소모 용량 없음)

import { hasCollectionAmount } from '@/config/shoppingCategories'
import type { CollectionItem } from '@/hooks/useCollectionItems'
import {
  formatAmountWithPackCount,
  formatPerPiecePriceLabel,
  formatShoppingDetailLine,
  formatUnitPriceLabel,
  formatUnitsPerPackLabel,
} from '@/lib/shoppingUnitPrice'

export function getCollectionFoodDetailLabels(item: CollectionItem): string[] {
  const packType = item.packType === 'box' ? 'box' : 'piece'
  const packCount = item.packCount ?? 1
  const unitsPerPack = item.unitsPerPack ?? 1
  const hasAmount = hasCollectionAmount(item.amount, item.amountUnit)

  if (!hasAmount) {
    const parts = formatShoppingDetailLine({
      price: item.purchasePrice,
      amount: 0,
      unit: 'g',
      packType,
      packCount,
      unitsPerPack,
    })
    return parts
  }

  const parts = formatShoppingDetailLine({
    price: item.purchasePrice,
    amount: item.amount,
    unit: item.amountUnit as 'g',
    packType,
    packCount,
    unitsPerPack,
  })
  const seen = new Set(parts)

  const amountLabel = formatAmountWithPackCount(item.amount, item.amountUnit, packType, packCount)
  if (!seen.has(amountLabel)) {
    parts.unshift(amountLabel)
    seen.add(amountLabel)
  }

  const unitLabel = formatUnitPriceLabel(item.purchasePrice, item.amount, item.amountUnit as 'g', packCount)
  if (unitLabel && !seen.has(unitLabel)) {
    parts.push(unitLabel)
    seen.add(unitLabel)
  }

  const packLabel = formatUnitsPerPackLabel(packType, unitsPerPack)
  if (packLabel && !seen.has(packLabel)) {
    parts.push(packLabel)
    seen.add(packLabel)
  }

  const perPiece = formatPerPiecePriceLabel(item.purchasePrice, packType, packCount, unitsPerPack)
  if (perPiece && !seen.has(perPiece)) {
    parts.push(perPiece)
  }

  return parts
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
  if (!hasCollectionAmount(item.amount, item.amountUnit)) return ''
  const packType = item.packType === 'box' ? 'box' : 'piece'
  return formatAmountWithPackCount(item.amount, item.amountUnit, packType, item.packCount)
}

export function formatCollectionPackListSubline(item: CollectionItem): string {
  return getCollectionPackDetailLabels(item).join(' · ')
}
