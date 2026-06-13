// 수정: Auto — 2026-06-05 (푸드 필드·쇼핑 마이그레이션)

import { sql } from 'drizzle-orm'

import { db, getDbClient } from '@/lib/db'
import { ensureShoppingSchema } from '@/lib/shoppingSchema'
import { collectionItems, shoppingItems } from '@/lib/schema'
import { todayIsoDate } from '@/lib/shoppingDate'

let schemaReady: Promise<void> | null = null

async function migrateShoppingToCollection() {
  await db.run(sql`CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`)

  const flagResult = await getDbClient().execute({
    sql: `SELECT value FROM app_meta WHERE key = ? LIMIT 1`,
    args: ['shopping_migrated'],
  })
  if (flagResult.rows[0]?.[0] === '1') return

  await ensureShoppingSchema()
  const rows = await db.select().from(shoppingItems)
  if (rows.length === 0) {
    await db.run(
      sql`INSERT OR REPLACE INTO app_meta (key, value) VALUES ('shopping_migrated', '1')`,
    )
    return
  }

  const fallbackDate = todayIsoDate()
  for (const row of rows) {
    await db.insert(collectionItems).values({
      mainCategory: 'food',
      subCategory: row.category,
      brand: row.brand ?? '',
      name: row.name,
      nameSuffix: '',
      model: '',
      size: '',
      description: '',
      purchasePrice: row.price,
      storeKey: row.storeKey,
      storeCustom: row.storeCustom,
      purchaseDate: row.lastPurchaseDate ?? fallbackDate,
      amount: row.amount,
      amountUnit: row.amountUnit,
      packType: row.packType ?? 'piece',
      packCount: row.packCount ?? 1,
      unitsPerPack: row.unitsPerPack ?? 1,
      optionType: 'none',
      optionData: '{}',
      imageData: row.imageData,
      createdAt: row.createdAt,
    })
  }

  await db.run(sql`DELETE FROM shopping_items`)
  await db.run(sql`INSERT OR REPLACE INTO app_meta (key, value) VALUES ('shopping_migrated', '1')`)
}

export async function ensureCollectionSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS collection_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        main_category TEXT NOT NULL,
        sub_category TEXT NOT NULL,
        brand TEXT NOT NULL DEFAULT '',
        name TEXT NOT NULL,
        model TEXT NOT NULL DEFAULT '',
        size TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        purchase_price INTEGER NOT NULL,
        store_key TEXT NOT NULL,
        store_custom TEXT,
        purchase_date TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        amount_unit TEXT NOT NULL DEFAULT 'g',
        pack_type TEXT NOT NULL DEFAULT 'piece',
        pack_count INTEGER NOT NULL DEFAULT 1,
        units_per_pack INTEGER NOT NULL DEFAULT 1,
        option_type TEXT NOT NULL DEFAULT 'none',
        option_data TEXT NOT NULL DEFAULT '{}',
        image_data TEXT,
        created_at TEXT NOT NULL
      )`)
      const foodColumns = [
        sql`ALTER TABLE collection_items ADD COLUMN amount REAL NOT NULL DEFAULT 0`,
        sql`ALTER TABLE collection_items ADD COLUMN amount_unit TEXT NOT NULL DEFAULT 'g'`,
        sql`ALTER TABLE collection_items ADD COLUMN pack_type TEXT NOT NULL DEFAULT 'piece'`,
        sql`ALTER TABLE collection_items ADD COLUMN pack_count INTEGER NOT NULL DEFAULT 1`,
        sql`ALTER TABLE collection_items ADD COLUMN units_per_pack INTEGER NOT NULL DEFAULT 1`,
      ]
      for (const stmt of foodColumns) {
        try {
          await db.run(stmt)
        } catch {
          /* column already exists */
        }
      }
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN option_type TEXT NOT NULL DEFAULT 'none'`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN option_data TEXT NOT NULL DEFAULT '{}'`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN size TEXT NOT NULL DEFAULT ''`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN name_suffix TEXT NOT NULL DEFAULT ''`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN repurchase_days INTEGER`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN repurchase_active INTEGER NOT NULL DEFAULT 0`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN food_scope TEXT NOT NULL DEFAULT 'regular'`)
      } catch {
        /* column already exists */
      }
      await db.run(sql`UPDATE collection_items SET food_scope = 'regular' WHERE main_category = 'food' AND (food_scope IS NULL OR food_scope = '')`)
      await migrateShoppingToCollection()
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
