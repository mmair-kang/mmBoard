// 수정: Auto — 2026-06-08
import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureAnnualPaymentSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS annual_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        month INTEGER NOT NULL,
        day_of_month INTEGER,
        amount INTEGER NOT NULL,
        switch_on INTEGER NOT NULL DEFAULT 0,
        progress_year TEXT NOT NULL,
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
