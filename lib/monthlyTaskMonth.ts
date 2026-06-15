// 수정: Auto — 2026-06-08
import dayjs from 'dayjs'

export function currentYearMonth(): string {
  return dayjs().format('YYYY-MM')
}

export type MonthlyTaskRow = {
  id: number
  title: string
  dayOfMonth: number | null
  optionType: string
  targetAmount: number | null
  currentAmount: number
  currentAmountUpdatedAt: string | null
  switchOn: number
  progressMonth: string
  createdAt: string
}

export function normalizeMonthlyTaskForCurrentMonth(
  row: MonthlyTaskRow,
  yearMonth = currentYearMonth(),
) {
  const isCurrentMonth = row.progressMonth === yearMonth
  return {
    ...row,
    currentAmount: isCurrentMonth ? row.currentAmount : 0,
    switchOn: isCurrentMonth ? row.switchOn === 1 : false,
  }
}

export function sortMonthlyTasks<T extends { dayOfMonth: number | null; createdAt: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    if (a.dayOfMonth != null && b.dayOfMonth != null) return a.dayOfMonth - b.dayOfMonth
    if (a.dayOfMonth != null) return -1
    if (b.dayOfMonth != null) return 1
    return a.createdAt.localeCompare(b.createdAt)
  })
}
