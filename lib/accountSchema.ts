// 수정: Auto — 2026-07-21 21:57 (관리계좌 테이블)
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
      await db.run(sql`CREATE TABLE IF NOT EXISTS managed_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        account_type TEXT NOT NULL DEFAULT 'general',
        balance INTEGER NOT NULL DEFAULT 0,
        balance_updated_at TEXT,
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
      try {
        await db.run(
          sql`ALTER TABLE main_accounts ADD COLUMN seongnam_love_balance INTEGER NOT NULL DEFAULT 0`,
        )
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE main_accounts ADD COLUMN seongnam_love_balance_updated_at TEXT`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(
          sql`ALTER TABLE main_accounts ADD COLUMN ibk_subscription_balance INTEGER NOT NULL DEFAULT 0`,
        )
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE main_accounts ADD COLUMN ibk_subscription_balance_updated_at TEXT`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(
          sql`ALTER TABLE main_accounts ADD COLUMN managed_group_name TEXT NOT NULL DEFAULT '관리계좌'`,
        )
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
