// 수정: Auto — 2026-06-05 (푸드 상세 라벨)

import type { CollectionItem } from '@/hooks/useCollectionItems'
import {
  formatAmountWithPackCount,
  formatPerPiecePriceLabel,
  formatShoppingDetailLine,
  formatUnitPriceLabel,
  formatUnitsPerBoxLabel,
} from '@/lib/shoppingUnitPrice'

export function getCollectionFoodDetailLabels(item: CollectionItem): string[] {
  const packType = item.packType === 'box' ? 'box' : 'piece'
  const packCount = item.packCount ?? 1
  const unitsPerPack = item.unitsPerPack ?? 1
  const parts = formatShoppingDetailLine({
    price: item.purchasePrice,
    amount: item.amount,
    unit: item.amountUnit,
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

  const unitLabel = formatUnitPriceLabel(item.purchasePrice, item.amount, item.amountUnit, packCount)
  if (unitLabel && !seen.has(unitLabel)) {
    parts.push(unitLabel)
    seen.add(unitLabel)
  }

  const boxLabel = formatUnitsPerBoxLabel(packType, unitsPerPack)
  if (boxLabel && !seen.has(boxLabel)) {
    parts.push(boxLabel)
    seen.add(boxLabel)
  }

  const perPiece = formatPerPiecePriceLabel(item.purchasePrice, packType, packCount, unitsPerPack)
  if (perPiece && !seen.has(perPiece)) {
    parts.push(perPiece)
  }

  return parts
}
