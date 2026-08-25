// 수정: Auto — 2026-08-25 00:50 (방 CRUD·정렬)

import { and, asc, eq, inArray } from 'drizzle-orm'

import {
  DEFAULT_ORGANIZE_ROOMS,
  ORGANIZE_ROOM_KEY_RE,
  ORGANIZE_ROOM_LABEL_MAX,
  createOrganizeKey,
  type OrganizeRoomRecord,
} from '@/config/organizeCabinets'
import { db } from '@/lib/db'
import { organizeCabinets, organizeCells, organizeRooms } from '@/lib/schema'

function rowToRoom(row: typeof organizeRooms.$inferSelect): OrganizeRoomRecord {
  return {
    key: row.key,
    label: row.label,
    sortOrder: row.sortOrder,
  }
}

export async function listOrganizeRooms(): Promise<OrganizeRoomRecord[]> {
  const rows = await db.select().from(organizeRooms).orderBy(asc(organizeRooms.sortOrder), asc(organizeRooms.key))
  if (rows.length === 0) return DEFAULT_ORGANIZE_ROOMS
  return rows.map(rowToRoom)
}

export async function getOrganizeRoom(key: string): Promise<OrganizeRoomRecord | null> {
  const rows = await db.select().from(organizeRooms).where(eq(organizeRooms.key, key)).limit(1)
  return rows[0] ? rowToRoom(rows[0]) : null
}

export async function createOrganizeRoom(label: string): Promise<OrganizeRoomRecord> {
  const trimmed = label.replace(/[\r\n]+/g, ' ').trim()
  if (!trimmed || trimmed.length > ORGANIZE_ROOM_LABEL_MAX) {
    throw new Error('invalid label')
  }

  const all = await listOrganizeRooms()
  let key = createOrganizeKey('room')
  while (!ORGANIZE_ROOM_KEY_RE.test(key) || all.some((room) => room.key === key)) {
    key = createOrganizeKey('room')
  }

  const now = new Date().toISOString()
  const sortOrder = all.length === 0 ? 0 : Math.max(...all.map((room) => room.sortOrder)) + 1
  const rows = await db
    .insert(organizeRooms)
    .values({
      key,
      label: trimmed,
      sortOrder,
      updatedAt: now,
    })
    .returning()

  if (!rows[0]) throw new Error('insert failed')
  return rowToRoom(rows[0])
}

export async function updateOrganizeRoom(key: string, label: string): Promise<OrganizeRoomRecord | null> {
  const trimmed = label.replace(/[\r\n]+/g, ' ').trim()
  if (!trimmed || trimmed.length > ORGANIZE_ROOM_LABEL_MAX) return null
  const existing = await getOrganizeRoom(key)
  if (!existing) return null

  const rows = await db
    .update(organizeRooms)
    .set({ label: trimmed, updatedAt: new Date().toISOString() })
    .where(eq(organizeRooms.key, key))
    .returning()
  return rows[0] ? rowToRoom(rows[0]) : null
}

export async function reorderOrganizeRooms(keys: string[]): Promise<OrganizeRoomRecord[]> {
  const existing = await listOrganizeRooms()
  if (keys.length !== existing.length) throw new Error('invalid order')
  const existingKeys = new Set(existing.map((room) => room.key))
  if (keys.some((key) => !existingKeys.has(key))) throw new Error('invalid order')
  if (new Set(keys).size !== keys.length) throw new Error('invalid order')

  const now = new Date().toISOString()
  for (let index = 0; index < keys.length; index += 1) {
    await db
      .update(organizeRooms)
      .set({ sortOrder: index, updatedAt: now })
      .where(eq(organizeRooms.key, keys[index]))
  }
  return listOrganizeRooms()
}

export async function deleteOrganizeRoom(key: string): Promise<boolean> {
  const rooms = await listOrganizeRooms()
  if (rooms.length <= 1) return false
  if (!rooms.some((room) => room.key === key)) return false

  const cabinets = await db.select({ key: organizeCabinets.key }).from(organizeCabinets).where(eq(organizeCabinets.room, key))
  const cabinetKeys = cabinets.map((row) => row.key)
  if (cabinetKeys.length > 0) {
    await db.delete(organizeCells).where(inArray(organizeCells.cabinetKey, cabinetKeys))
  }
  await db.delete(organizeCells).where(eq(organizeCells.room, key))
  await db.delete(organizeCabinets).where(eq(organizeCabinets.room, key))
  await db.delete(organizeRooms).where(eq(organizeRooms.key, key))

  const remaining = await listOrganizeRooms()
  const now = new Date().toISOString()
  for (let index = 0; index < remaining.length; index += 1) {
    await db
      .update(organizeRooms)
      .set({ sortOrder: index, updatedAt: now })
      .where(and(eq(organizeRooms.key, remaining[index].key)))
  }
  return true
}
