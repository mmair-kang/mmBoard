// 수정: Auto — 2026-07-19 02:45 (목록 칩 컬럼)
// 수정: Auto — 2026-07-19 02:05 (수시 hidden 오적용 수정)
// 수정: Auto — 2026-07-19 01:50 (빈 중복 항목 정리)
// 수정: Auto — 2026-07-19 00:15 (product·변형 마이그레이션)

import { and, eq, isNull, sql } from 'drizzle-orm'

import { db, getDbClient } from '@/lib/db'
import { ensureShoppingSchema } from '@/lib/shoppingSchema'
import { collectionItems, collectionProducts, shoppingItems } from '@/lib/schema'
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

async function migrateFoodItemsToProducts() {
  const flagResult = await getDbClient().execute({
    sql: `SELECT value FROM app_meta WHERE key = ? LIMIT 1`,
    args: ['collection_products_migrated'],
  })
  if (flagResult.rows[0]?.[0] === '1') return

  const orphanFood = await db
    .select()
    .from(collectionItems)
    .where(and(eq(collectionItems.mainCategory, 'food'), isNull(collectionItems.productId)))

  for (const row of orphanFood) {
    const now = row.createdAt || new Date().toISOString()
    const inserted = await db
      .insert(collectionProducts)
      .values({
        name: row.name,
        mainCategory: 'food',
        subCategory: row.subCategory,
        foodScope: row.foodScope || 'regular',
        listChipFlags: '{"amount":true,"unitsPerPack":true,"unitPrice":true,"perPiece":true}',
        createdAt: now,
      })
      .returning()
    const product = inserted[0]
    if (!product) continue
    await db
      .update(collectionItems)
      .set({ productId: product.id, isSelected: 1 })
      .where(eq(collectionItems.id, row.id))
  }

  await db.run(
    sql`INSERT OR REPLACE INTO app_meta (key, value) VALUES ('collection_products_migrated', '1')`,
  )
}

/**
 * 이름만 추가하다 생긴 빈 제품(변형 0개)이
 * 같은 이름·카테고리·상시/수시의 기존 항목과 겹치면 빈 쪽을 삭제한다.
 */
async function dedupeEmptyDuplicateProducts() {
  const flagResult = await getDbClient().execute({
    sql: `SELECT value FROM app_meta WHERE key = ? LIMIT 1`,
    args: ['collection_products_empty_deduped'],
  })
  if (flagResult.rows[0]?.[0] === '1') return

  const products = await db.select().from(collectionProducts)
  if (products.length === 0) {
    await db.run(
      sql`INSERT OR REPLACE INTO app_meta (key, value) VALUES ('collection_products_empty_deduped', '1')`,
    )
    return
  }

  const variantRows = await db
    .select({ productId: collectionItems.productId })
    .from(collectionItems)
    .where(eq(collectionItems.mainCategory, 'food'))

  const variantCount = new Map<number, number>()
  for (const row of variantRows) {
    if (row.productId == null) continue
    variantCount.set(row.productId, (variantCount.get(row.productId) ?? 0) + 1)
  }

  type GroupKey = string
  const groups = new Map<GroupKey, typeof products>()
  for (const product of products) {
    const key = `${product.foodScope}\0${product.subCategory}\0${product.name.trim()}`
    const list = groups.get(key) ?? []
    list.push(product)
    groups.set(key, list)
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue

    const withVariants = group.filter((p) => (variantCount.get(p.id) ?? 0) > 0)
    const empty = group.filter((p) => (variantCount.get(p.id) ?? 0) === 0)

    // 제품이 있는 항목이 있으면 빈 중복만 삭제
    if (withVariants.length > 0) {
      for (const product of empty) {
        await db.delete(collectionProducts).where(eq(collectionProducts.id, product.id))
      }
      continue
    }

    // 전부 빈 항목이면 하나만 남기고 삭제
    const [, ...dupes] = empty.sort((a, b) => a.id - b.id)
    for (const product of dupes) {
      await db.delete(collectionProducts).where(eq(collectionProducts.id, product.id))
    }
  }

  await db.run(
    sql`INSERT OR REPLACE INTO app_meta (key, value) VALUES ('collection_products_empty_deduped', '1')`,
  )
}

/** 수시 항목이 repurchase_active=0 때문에 숨김 처리된 것 복구 */
async function unhideOccasionalFoodItems() {
  const flagResult = await getDbClient().execute({
    sql: `SELECT value FROM app_meta WHERE key = ? LIMIT 1`,
    args: ['collection_occasional_unhidden'],
  })
  if (flagResult.rows[0]?.[0] === '1') return

  await db.run(
    sql`UPDATE collection_items SET hidden = 0 WHERE main_category = 'food' AND food_scope = 'occasional' AND hidden = 1`,
  )

  await db.run(
    sql`INSERT OR REPLACE INTO app_meta (key, value) VALUES ('collection_occasional_unhidden', '1')`,
  )
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
      await db.run(sql`CREATE TABLE IF NOT EXISTS collection_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        main_category TEXT NOT NULL,
        sub_category TEXT NOT NULL,
        food_scope TEXT NOT NULL DEFAULT 'regular',
        list_chip_flags TEXT NOT NULL DEFAULT '{"amount":true,"unitsPerPack":true,"unitPrice":true,"perPiece":true}',
        created_at TEXT NOT NULL
      )`)
      try {
        await db.run(
          sql`ALTER TABLE collection_products ADD COLUMN list_chip_flags TEXT NOT NULL DEFAULT '{"amount":true,"unitsPerPack":true,"unitPrice":true,"perPiece":true}'`,
        )
      } catch {
        /* column already exists */
      }
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
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN product_id INTEGER`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE collection_items ADD COLUMN is_selected INTEGER NOT NULL DEFAULT 1`)
      } catch {
        /* column already exists */
      }
      await db.run(sql`UPDATE collection_items SET food_scope = 'regular' WHERE main_category = 'food' AND (food_scope IS NULL OR food_scope = '')`)
      // 상시만: 예전 repurchase OFF → 숨김. 수시에 적용하면 목록이 비어 보임
      await db.run(
        sql`UPDATE collection_items SET hidden = 1 WHERE main_category = 'food' AND food_scope = 'regular' AND repurchase_active = 0 AND hidden = 0`,
      )
      await migrateShoppingToCollection()
      await migrateFoodItemsToProducts()
      await dedupeEmptyDuplicateProducts()
      await unhideOccasionalFoodItems()
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
