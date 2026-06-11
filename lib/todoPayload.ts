// 수정: Auto — 2026-06-11

import { parseLastPurchaseDate } from '@/lib/shoppingDate'

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export type TodoItemPayload = {
  content: string
  dueDate: string | null
  dueTime: string | null
}

export function parseTodoTime(value: unknown): string | null {
  if (value == null || value === '') return null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!TIME_RE.test(trimmed)) return null
  return trimmed
}

export function parseTodoItemPayload(body: Record<string, unknown>): TodoItemPayload | null {
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (!content) return null

  const dueDateRaw = body.dueDate
  const dueDate =
    dueDateRaw == null || dueDateRaw === ''
      ? null
      : parseLastPurchaseDate(dueDateRaw)
  if (dueDateRaw != null && dueDateRaw !== '' && !dueDate) return null

  const dueTime = parseTodoTime(body.dueTime)
  if (body.dueTime != null && body.dueTime !== '' && !dueTime) return null

  return { content, dueDate, dueTime }
}
