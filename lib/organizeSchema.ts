// 수정: Auto — 2026-08-25 00:50 (방·수납장 시드)

import { sql } from 'drizzle-orm'

import { DEFAULT_ORGANIZE_CABINETS, DEFAULT_ORGANIZE_ROOMS } from '@/config/organizeCabinets'
import { db } from '@/lib/db'
import { organizeCabinets, organizeRooms } from '@/lib/schema'

let schemaReady: Promise<void> | null = null

export async function ensureOrganizeSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS organize_rooms (
        key TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      )`)
      await db.run(sql`CREATE TABLE IF NOT EXISTS organize_cabinets (
        key TEXT PRIMARY KEY,
        room TEXT NOT NULL,
        label TEXT NOT NULL,
        layout_type TEXT NOT NULL,
        cols INTEGER NOT NULL,
        rows INTEGER NOT NULL,
        shelves INTEGER NOT NULL DEFAULT 1,
        shelf_rows INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        color TEXT NOT NULL,
        bg TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`)
      await db.run(sql`CREATE TABLE IF NOT EXISTS organize_cells (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room TEXT NOT NULL,
        cabinet_key TEXT NOT NULL,
        row_index INTEGER NOT NULL,
        col_index INTEGER NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL
      )`)
      await db.run(
        sql`CREATE UNIQUE INDEX IF NOT EXISTS organize_cells_key
            ON organize_cells (room, cabinet_key, row_index, col_index)`,
      )

      const now = new Date().toISOString()
      const roomRows = await db.select({ key: organizeRooms.key }).from(organizeRooms).limit(1)
      if (roomRows.length === 0) {
        for (const room of DEFAULT_ORGANIZE_ROOMS) {
          await db.insert(organizeRooms).values({
            key: room.key,
            label: room.label,
            sortOrder: room.sortOrder,
            updatedAt: now,
          })
        }
      }

      const cabinetRows = await db.select({ key: organizeCabinets.key }).from(organizeCabinets).limit(1)
      if (cabinetRows.length === 0) {
        for (const cabinet of DEFAULT_ORGANIZE_CABINETS) {
          await db.insert(organizeCabinets).values({
            key: cabinet.key,
            room: cabinet.room,
            label: cabinet.label,
            layoutType: cabinet.layoutType,
            cols: cabinet.cols,
            rows: cabinet.rows,
            shelves: cabinet.shelves,
            shelfRows: cabinet.shelfRows,
            sortOrder: cabinet.sortOrder,
            color: cabinet.color,
            bg: cabinet.bg,
            updatedAt: now,
          })
        }
      }
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
