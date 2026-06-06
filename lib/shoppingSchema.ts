import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureShoppingSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS shopping_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        amount REAL NOT NULL,
        amount_unit TEXT NOT NULL,
        pack_type TEXT NOT NULL DEFAULT 'piece',
        pack_count INTEGER NOT NULL DEFAULT 1,
        units_per_pack INTEGER NOT NULL DEFAULT 1,
        store_key TEXT NOT NULL,
        store_custom TEXT,
        last_purchase_date TEXT,
        image_data TEXT,
        created_at TEXT NOT NULL
      )`)
      try {
        await db.run(sql`ALTER TABLE shopping_items ADD COLUMN last_purchase_date TEXT`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE shopping_items ADD COLUMN pack_count INTEGER NOT NULL DEFAULT 1`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE shopping_items ADD COLUMN units_per_pack INTEGER NOT NULL DEFAULT 1`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE shopping_items ADD COLUMN pack_type TEXT NOT NULL DEFAULT 'piece'`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE shopping_items ADD COLUMN image_data TEXT`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE shopping_items ADD COLUMN brand TEXT NOT NULL DEFAULT ''`)
      } catch {
        /* column already exists */
      }
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
