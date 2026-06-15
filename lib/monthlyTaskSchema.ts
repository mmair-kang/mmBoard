// 수정: Auto — 2026-06-15 (current_amount_updated_at 마이그레이션)
import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureMonthlyTaskSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS monthly_task_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        day_of_month INTEGER,
        option_type TEXT NOT NULL,
        target_amount INTEGER,
        current_amount INTEGER NOT NULL DEFAULT 0,
        switch_on INTEGER NOT NULL DEFAULT 0,
        progress_month TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`)
      try {
        await db.run(sql`ALTER TABLE monthly_task_items ADD COLUMN current_amount_updated_at TEXT`)
      } catch {
        /* column already exists */
      }
      await db.run(
        sql`UPDATE monthly_task_items SET current_amount_updated_at = created_at WHERE current_amount_updated_at IS NULL AND current_amount > 0`,
      )
      await db.run(sql`CREATE TABLE IF NOT EXISTS monthly_task_card_extras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        extra_type TEXT NOT NULL,
        title TEXT,
        day_of_month INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        checked INTEGER NOT NULL DEFAULT 0,
        switch_on INTEGER NOT NULL DEFAULT 0,
        progress_month TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`)
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
