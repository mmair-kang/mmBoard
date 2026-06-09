// 수정: Auto — 2026-06-08

import { formatMonthlyDayLabel, isMonthlyAnytimeDay } from '@/lib/monthlyDayLabel'

export type CardExtraLike = {
  extraType: 'scheduled' | 'payment_switch'
  title: string | null
  dayOfMonth: number | null
  amount: number
  checked: boolean
  switchOn: boolean
}

export type CardDeduction = {
  label: string
  amount: number
  sortDay: number
}

export type CardNeededResult = {
  baseNeeded: number
  needed: number
  deductions: CardDeduction[]
  totalDeduction: number
}

export type CardProgressBreakdown = {
  currentPct: number
  scheduledPct: number
  totalPct: number
  fulfilled: boolean
}

export function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

function isExtraPending(extra: CardExtraLike): boolean {
  if (extra.extraType === 'scheduled') return !extra.checked
  return !extra.switchOn
}

function deductionSortDay(dayOfMonth: number | null): number {
  if (isMonthlyAnytimeDay(dayOfMonth)) return 1000
  return dayOfMonth ?? 1000
}

export function calcCardNeededAmount(
  target: number,
  current: number,
  extras: CardExtraLike[],
): CardNeededResult {
  const baseNeeded = Math.max(0, target - current)
  const deductions: CardDeduction[] = []

  for (const extra of extras) {
    if (!isExtraPending(extra)) continue

    const day = extra.dayOfMonth
    const dayLabel = formatMonthlyDayLabel(day)
    const title = extra.title?.trim() || '결제'
    deductions.push({
      label: isMonthlyAnytimeDay(day) ? title : `${dayLabel} ${title}`,
      amount: extra.amount,
      sortDay: deductionSortDay(day),
    })
  }

  deductions.sort((a, b) => a.sortDay - b.sortDay)
  const totalDeduction = deductions.reduce((sum, row) => sum + row.amount, 0)

  return {
    baseNeeded,
    needed: Math.max(0, baseNeeded - totalDeduction),
    deductions,
    totalDeduction,
  }
}

export function calcCardProgressBreakdown(
  target: number,
  current: number,
  totalDeduction: number,
): CardProgressBreakdown {
  if (target <= 0) {
    return { currentPct: 0, scheduledPct: 0, totalPct: 0, fulfilled: false }
  }

  const currentPct = Math.min(100, (current / target) * 100)
  const scheduledRaw = (totalDeduction / target) * 100
  const scheduledPct = Math.min(100 - currentPct, scheduledRaw)
  const totalPct = Math.min(100, currentPct + scheduledPct)
  const fulfilled = current + totalDeduction >= target

  return { currentPct, scheduledPct, totalPct, fulfilled }
}
