// 수정: Auto — 2026-06-15 (balance_updated_at 마이그레이션)
import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureAccountSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS main_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      )`)
      await db.run(sql`CREATE TABLE IF NOT EXISTS account_outflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        day_of_month INTEGER NOT NULL,
        title TEXT NOT NULL,
        amount INTEGER NOT NULL,
        switch_on INTEGER NOT NULL DEFAULT 0,
        progress_month TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`)
      try {
        await db.run(sql`ALTER TABLE main_accounts ADD COLUMN balance_updated_at TEXT`)
      } catch {
        /* column already exists */
      }
      await db.run(
        sql`UPDATE main_accounts SET balance_updated_at = updated_at WHERE balance_updated_at IS NULL`,
      )
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
