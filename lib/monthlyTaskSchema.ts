// 수정: Auto — 2026-06-08
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
