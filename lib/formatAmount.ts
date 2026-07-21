// 수정: Auto — 2026-07-21 21:43

export function formatAmountDisplay(value: number | null | undefined): string {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return amount.toLocaleString('ko-KR')
}

export function formatAmountDigitsInput(digits: string): string {
  const cleaned = digits.replace(/[^\d]/g, '')
  if (!cleaned) return ''
  return Number(cleaned).toLocaleString('ko-KR')
}

export function parseAmountDigits(input: string): number | null {
  const cleaned = input.replace(/[^\d]/g, '')
  if (!cleaned) return null
  const parsed = Math.round(Number(cleaned))
  if (!Number.isFinite(parsed)) return null
  return parsed
}
