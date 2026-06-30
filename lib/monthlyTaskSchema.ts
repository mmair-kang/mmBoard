// 수정: Auto — 2026-06-30 (KB카드 시드)
import { sql } from 'drizzle-orm'

import { db, getDbClient } from '@/lib/db'
import { currentYearMonth } from '@/lib/monthlyTaskMonth'

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

      const kbResult = await getDbClient().execute({
        sql: `SELECT COUNT(*) AS cnt FROM monthly_task_items WHERE option_type = ? AND title = ?`,
        args: ['card_benefit', 'KB카드'],
      })
      const kbCount = Number(kbResult.rows[0]?.[0] ?? 0)
      if (kbCount === 0) {
        const now = new Date().toISOString()
        await db.run(sql`
          INSERT INTO monthly_task_items (
            title, day_of_month, option_type, target_amount, current_amount, switch_on, progress_month, created_at
          ) VALUES ('KB카드', NULL, 'card_benefit', 400000, 0, 0, ${currentYearMonth()}, ${now})
        `)
      }
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
