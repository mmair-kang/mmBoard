// 수정: Auto — 2026-06-08

export const AMOUNT_UNITS = ['g', 'kg', 'ml', 'L'] as const
export type AmountUnit = (typeof AMOUNT_UNITS)[number]

export function calcDiscountRatePercent(originalPrice: number, discountAmount: number): number | null {
  if (originalPrice <= 0 || discountAmount < 0 || discountAmount > originalPrice) return null
  return (discountAmount / originalPrice) * 100
}

export function calcProductDiscount(productPrice: number, discountRatePercent: number) {
  if (productPrice <= 0 || discountRatePercent < 0 || discountRatePercent > 100) return null
  const discountWon = Math.round((productPrice * discountRatePercent) / 100)
  const salePrice = productPrice - discountWon
  return { discountWon, salePrice }
}

export function calcPricePer100(price: number, amount: number): number | null {
  if (price <= 0 || amount <= 0) return null
  return (price / amount) * 100
}

export function formatDiscountRate(rate: number): string {
  const rounded = Math.round(rate * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`
}

export function unitPer100Label(unit: AmountUnit): string {
  return `100${unit}당`
}
