// 수정: Auto — 2026-07-13 01:23 (탈회 금지기간)
// 수정: Auto — 2026-07-13 01:19 (연회비)
// 수정: Auto — 2026-07-12 23:47 (신청불가 사유 컬럼)
// 수정: Auto — 2026-07-12 23:36
import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureCardApplicationSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS card_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        card_company TEXT NOT NULL DEFAULT '',
        card_name TEXT NOT NULL DEFAULT '',
        application_blocked INTEGER NOT NULL DEFAULT 0,
        blocked_reason TEXT,
        blocked_confirmed_date TEXT,
        annual_fee INTEGER NOT NULL DEFAULT 0,
        spend_amount INTEGER NOT NULL DEFAULT 0,
        benefit_amount INTEGER NOT NULL DEFAULT 0,
        usage_start_date TEXT,
        usage_end_date TEXT,
        benefit_date TEXT,
        withdrawal_restrict_period TEXT,
        cancel_date TEXT,
        created_at TEXT NOT NULL
      )`)
      try {
        await db.run(sql`ALTER TABLE card_applications ADD COLUMN withdrawal_restrict_period TEXT`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE card_applications ADD COLUMN annual_fee INTEGER NOT NULL DEFAULT 0`)
      } catch {
        /* column already exists */
      }
      try {
        await db.run(sql`ALTER TABLE card_applications ADD COLUMN blocked_reason TEXT`)
      } catch {
        /* column already exists */
      }
      await db.run(sql`
        UPDATE card_applications
        SET blocked_reason = 'benefit_received',
            benefit_date = COALESCE(benefit_date, blocked_confirmed_date)
        WHERE application_blocked = 1
          AND blocked_reason IS NULL
          AND blocked_confirmed_date IS NOT NULL
      `)
      await db.run(sql`
        UPDATE card_applications
        SET blocked_reason = 'in_use'
        WHERE application_blocked = 1
          AND blocked_reason IS NULL
      `)
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
