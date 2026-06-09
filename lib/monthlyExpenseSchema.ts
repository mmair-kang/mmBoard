// 수정: Auto — 2026-06-08
import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureMonthlyExpenseSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS monthly_fixed_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        day_of_month INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        pay_type TEXT NOT NULL,
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
