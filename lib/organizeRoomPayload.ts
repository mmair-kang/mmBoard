// 수정: Auto — 2026-08-25 00:50 (방 이름·정렬 파싱)

import { ORGANIZE_ROOM_LABEL_MAX } from '@/config/organizeCabinets'

export function parseOrganizeRoomLabel(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const label = value.replace(/[\r\n]+/g, ' ').trim()
  if (!label || label.length > ORGANIZE_ROOM_LABEL_MAX) return null
  return label
}

export function parseOrganizeRoomOrder(body: Record<string, unknown>): string[] | null {
  if (!Array.isArray(body.keys)) return null
  const keys: string[] = []
  for (const item of body.keys) {
    if (typeof item !== 'string' || !item.trim()) return null
    keys.push(item.trim())
  }
  if (keys.length === 0) return null
  if (new Set(keys).size !== keys.length) return null
  return keys
}
