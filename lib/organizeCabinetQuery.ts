// 수정: Auto — 2026-08-25 00:50 (수납장 CRUD·색상)

import { and, asc, eq, max } from 'drizzle-orm'

import {
  DEFAULT_ORGANIZE_CABINETS,
  ORGANIZE_COLOR_PRESETS,
  computeCabinetRows,
  createOrganizeKey,
  getColorPresetById,
  isOrganizeLayoutType,
  isOrganizeRoom,
  matchColorPreset,
  type OrganizeCabinetRecord,
  type OrganizeLayoutType,
  type OrganizeRoom,
} from '@/config/organizeCabinets'
import { db } from '@/lib/db'
import { getOrganizeRoom } from '@/lib/organizeRoomQuery'
import { organizeCabinets, organizeCells } from '@/lib/schema'

function rowToRecord(row: typeof organizeCabinets.$inferSelect): OrganizeCabinetRecord | null {
  if (!isOrganizeRoom(row.room) || !isOrganizeLayoutType(row.layoutType)) return null
  return {
    key: row.key,
    room: row.room,
    label: row.label,
    layoutType: row.layoutType,
    cols: row.cols,
    rows: row.rows,
    shelves: row.shelves,
    shelfRows: row.shelfRows,
    sortOrder: row.sortOrder,
    color: row.color,
    bg: row.bg,
  }
}

export async function listOrganizeCabinets(): Promise<OrganizeCabinetRecord[]> {
  const rows = await db.select().from(organizeCabinets).orderBy(asc(organizeCabinets.sortOrder), asc(organizeCabinets.key))
  const mapped = rows.map(rowToRecord).filter((row): row is OrganizeCabinetRecord => row != null)
  if (mapped.length > 0) return mapped
  return DEFAULT_ORGANIZE_CABINETS
}

export async function getOrganizeCabinetRecord(key: string): Promise<OrganizeCabinetRecord | null> {
  const rows = await db.select().from(organizeCabinets).where(eq(organizeCabinets.key, key)).limit(1)
  if (!rows[0]) return null
  return rowToRecord(rows[0])
}

export type OrganizeCabinetWriteInput = {
  label: string
  layoutType: OrganizeLayoutType
  cols: number
  rows: number
  shelves: number
  shelfRows: number
  color: string
  bg: string
}

export type OrganizeCabinetUpdateInput = OrganizeCabinetWriteInput

function resolveTheme(colorPresetId?: string | null, color?: string, bg?: string) {
  if (colorPresetId) {
    const preset = getColorPresetById(colorPresetId)
    if (preset) return { color: preset.color, bg: preset.bg }
  }
  if (color && bg) return matchColorPreset(color, bg)
  if (color) return matchColorPreset(color, '')
  return ORGANIZE_COLOR_PRESETS[0]
}

export async function updateOrganizeCabinet(
  key: string,
  input: OrganizeCabinetUpdateInput,
): Promise<OrganizeCabinetRecord | null> {
  const existing = await getOrganizeCabinetRecord(key)
  if (!existing) return null

  const theme = resolveTheme(null, input.color, input.bg)
  const rows = computeCabinetRows(input.layoutType, input.rows, input.shelves, input.shelfRows)
  const now = new Date().toISOString()
  const updated = await db
    .update(organizeCabinets)
    .set({
      label: input.label,
      layoutType: input.layoutType,
      cols: input.cols,
      rows,
      shelves: input.layoutType === 'shelves' ? input.shelves : 1,
      shelfRows: input.layoutType === 'shelves' ? input.shelfRows : rows,
      color: theme.color,
      bg: theme.bg,
      updatedAt: now,
    })
    .where(eq(organizeCabinets.key, key))
    .returning()

  if (!updated[0]) return null
  return rowToRecord(updated[0])
}

export async function createOrganizeCabinet(
  room: OrganizeRoom,
  input: OrganizeCabinetWriteInput & { colorPresetId?: string },
): Promise<OrganizeCabinetRecord | null> {
  const roomRow = await getOrganizeRoom(room)
  if (!roomRow) return null

  const theme = resolveTheme(input.colorPresetId, input.color, input.bg)
  const rows = computeCabinetRows(input.layoutType, input.rows, input.shelves, input.shelfRows)
  const maxSort = await db
    .select({ value: max(organizeCabinets.sortOrder) })
    .from(organizeCabinets)
    .where(eq(organizeCabinets.room, room))
  const sortOrder = (maxSort[0]?.value ?? -1) + 1
  const key = createOrganizeKey('cab')
  const now = new Date().toISOString()

  const inserted = await db
    .insert(organizeCabinets)
    .values({
      key,
      room,
      label: input.label,
      layoutType: input.layoutType,
      cols: input.cols,
      rows,
      shelves: input.layoutType === 'shelves' ? input.shelves : 1,
      shelfRows: input.layoutType === 'shelves' ? input.shelfRows : rows,
      sortOrder,
      color: theme.color,
      bg: theme.bg,
      updatedAt: now,
    })
    .returning()

  return inserted[0] ? rowToRecord(inserted[0]) : null
}

export async function deleteOrganizeCabinet(key: string): Promise<boolean> {
  const existing = await getOrganizeCabinetRecord(key)
  if (!existing) return false
  await db.delete(organizeCells).where(eq(organizeCells.cabinetKey, key))
  await db.delete(organizeCabinets).where(eq(organizeCabinets.key, key))

  const siblings = await db
    .select()
    .from(organizeCabinets)
    .where(eq(organizeCabinets.room, existing.room))
    .orderBy(asc(organizeCabinets.sortOrder), asc(organizeCabinets.key))
  const now = new Date().toISOString()
  for (let index = 0; index < siblings.length; index += 1) {
    await db
      .update(organizeCabinets)
      .set({ sortOrder: index, updatedAt: now })
      .where(and(eq(organizeCabinets.key, siblings[index].key)))
  }
  return true
}

export async function listOrganizeCabinetsByRoom(room: OrganizeRoom): Promise<OrganizeCabinetRecord[]> {
  const all = await listOrganizeCabinets()
  return all.filter((cabinet) => cabinet.room === room)
}
