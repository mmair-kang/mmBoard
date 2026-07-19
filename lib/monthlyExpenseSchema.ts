// 수정: Auto — 2026-07-19 16:15 (결제 카드)
// 수정: Auto — 2026-07-19 03:15 (통신비 타입·상세)
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
        monthly_task_id INTEGER,
        expense_type TEXT NOT NULL DEFAULT 'none',
        telecom_detail TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`)
      try {
        await db.run(sql`ALTER TABLE monthly_fixed_expenses ADD COLUMN expense_type TEXT NOT NULL DEFAULT 'none'`)
      } catch {
        /* exists */
      }
      try {
        await db.run(sql`ALTER TABLE monthly_fixed_expenses ADD COLUMN telecom_detail TEXT`)
      } catch {
        /* exists */
      }
      try {
        await db.run(sql`ALTER TABLE monthly_fixed_expenses ADD COLUMN monthly_task_id INTEGER`)
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
