// 수정: Auto — 2026-06-11

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function formatTodoDueDateLabel(dueDate: string | null | undefined): string | null {
  if (!dueDate) return null
  const match = ISO_DATE_RE.exec(dueDate)
  if (!match) return dueDate
  return `${Number(match[2])}/${Number(match[3])}`
}

export function todoDueSortKey(dueDate: string | null, dueTime: string | null): string | null {
  if (!dueDate && !dueTime) return null
  const date = dueDate ?? '9999-12-31'
  const time = dueTime ?? '99:99'
  return `${date}T${time}`
}

export function sortTodoItems<T extends { dueDate: string | null; dueTime: string | null; createdAt: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aKey = todoDueSortKey(a.dueDate, a.dueTime)
    const bKey = todoDueSortKey(b.dueDate, b.dueTime)
    if (aKey == null && bKey == null) {
      return b.createdAt.localeCompare(a.createdAt)
    }
    if (aKey == null) return 1
    if (bKey == null) return -1
    const byDue = aKey.localeCompare(bKey)
    if (byDue !== 0) return byDue
    return a.createdAt.localeCompare(b.createdAt)
  })
}
