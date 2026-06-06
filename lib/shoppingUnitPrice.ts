// 수정: Auto — 2026-06-05 (mg 단위)
import { getPackTypeLabel, type AmountUnit, type PackType, isMultiUnitPackType } from '@/config/shoppingCategories'

export type ShoppingQuantityMeta = {
  price: number
  amount: number
  unit: AmountUnit
  packType?: PackType
  packCount?: number
  unitsPerPack?: number
}

function normalizePackCount(packCount: number) {
  return Number.isInteger(packCount) && packCount >= 1 ? packCount : 1
}

function normalizeUnitsPerPack(unitsPerPack: number) {
  return Number.isInteger(unitsPerPack) && unitsPerPack >= 1 ? unitsPerPack : 1
}

function resolvePackType(packType?: PackType): PackType {
  if (packType === 'box' || packType === 'bundle') return packType
  return 'piece'
}

/** 총 용량 = 1단위 용량 × 구매 수량 */
export function getTotalAmount(amount: number, packCount = 1) {
  return amount * normalizePackCount(packCount)
}

/** 총 낱개 수 — 개: 구매 수량, 박스/묶음: 수량 × 1단위당 개수 */
export function getTotalPieces(packType: PackType = 'piece', packCount = 1, unitsPerPack = 1) {
  const count = normalizePackCount(packCount)
  if (isMultiUnitPackType(packType)) return count * normalizeUnitsPerPack(unitsPerPack)
  return count
}

export function formatUnitPriceLabel(
  price: number,
  amount: number,
  unit: AmountUnit,
  packCount = 1,
): string | null {
  const totalAmount = getTotalAmount(amount, packCount)
  if (!Number.isFinite(price) || !Number.isFinite(totalAmount) || totalAmount <= 0) return null

  let unitPrice: number
  let prefix: string

  switch (unit) {
    case 'mg':
      unitPrice = (price / totalAmount) * 100
      prefix = '100mg당'
      break
    case 'g':
      unitPrice = (price / totalAmount) * 100
      prefix = '100g당'
      break
    case 'ml':
      unitPrice = (price / totalAmount) * 100
      prefix = '100ml당'
      break
    case 'kg':
      unitPrice = price / totalAmount
      prefix = '1kg당'
      break
    default:
      return null
  }

  return `${prefix} ${Math.round(unitPrice).toLocaleString('ko-KR')}원`
}

/** 낱개 1개 기준 가격 */
export function formatPerPiecePriceLabel(
  price: number,
  packType: PackType = 'piece',
  packCount = 1,
  unitsPerPack = 1,
): string | null {
  const totalPieces = getTotalPieces(packType, packCount, unitsPerPack)
  if (!Number.isFinite(price) || totalPieces <= 0) return null
  const perPiece = Math.round(price / totalPieces)
  return `1개당 ${perPiece.toLocaleString('ko-KR')}원`
}

export function formatAmountWithPackCount(
  amount: number,
  unit: string,
  packType: PackType = 'piece',
  packCount = 1,
): string {
  const value = Number.isInteger(amount) ? String(amount) : String(amount)
  const base = `${value}${unit}`
  const typeLabel = getPackTypeLabel(packType)
  if (packCount > 1) return `${base} × ${packCount}${typeLabel}`
  return base
}

/** 박스/묶음일 때 — 1단위당 N개 */
export function formatUnitsPerPackLabel(packType: PackType | string, unitsPerPack = 1): string | null {
  if (!isMultiUnitPackType(packType)) return null
  const count = normalizeUnitsPerPack(unitsPerPack)
  if (count === 1) return null
  const unitName = packType === 'bundle' ? '묶음' : '박스'
  return `1${unitName}당 ${count}개`
}

/** @deprecated formatUnitsPerPackLabel 사용 */
export function formatUnitsPerBoxLabel(packType: PackType, unitsPerPack = 1): string | null {
  return formatUnitsPerPackLabel(packType, unitsPerPack)
}

export function formatShoppingDetailLine(meta: ShoppingQuantityMeta): string[] {
  const packType = resolvePackType(meta.packType)
  const packCount = normalizePackCount(meta.packCount ?? 1)
  const unitsPerPack = normalizeUnitsPerPack(meta.unitsPerPack ?? 1)
  const parts: string[] = []

  const boxLabel = formatUnitsPerPackLabel(packType, unitsPerPack)
  if (boxLabel) parts.push(boxLabel)

  if (isMultiUnitPackType(packType) && packCount > 1) {
    parts.push(`총 ${getTotalPieces(packType, packCount, unitsPerPack)}개`)
  } else if (packType === 'piece' && packCount > 1) {
    parts.push(`총 ${packCount}개`)
  }

  const volumeLabel = formatUnitPriceLabel(meta.price, meta.amount, meta.unit, packCount)
  if (volumeLabel) parts.push(volumeLabel)

  const perPieceLabel = formatPerPiecePriceLabel(meta.price, packType, packCount, unitsPerPack)
  if (perPieceLabel) {
    const showPerPiece =
      isMultiUnitPackType(packType) ? unitsPerPack > 1 || packCount > 1 : packCount > 1
    if (showPerPiece) parts.push(perPieceLabel)
  }

  return parts
}
