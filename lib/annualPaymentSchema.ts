// 수정: Auto — 2026-07-19 16:05 (결제방식·카드)
// 수정: Auto — 2026-07-19 14:40 (연납 타입·상세 컬럼)
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
        payment_type TEXT NOT NULL DEFAULT 'none',
        detail_json TEXT,
        pay_type TEXT NOT NULL DEFAULT 'card',
        monthly_task_id INTEGER,
        switch_on INTEGER NOT NULL DEFAULT 0,
        progress_year TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`)
      try {
        await db.run(sql`ALTER TABLE annual_payments ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'none'`)
      } catch {
        /* exists */
      }
      try {
        await db.run(sql`ALTER TABLE annual_payments ADD COLUMN detail_json TEXT`)
      } catch {
        /* exists */
      }
      try {
        await db.run(sql`ALTER TABLE annual_payments ADD COLUMN pay_type TEXT NOT NULL DEFAULT 'card'`)
      } catch {
        /* exists */
      }
      try {
        await db.run(sql`ALTER TABLE annual_payments ADD COLUMN monthly_task_id INTEGER`)
      } catch {
        /* exists */
      }
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
