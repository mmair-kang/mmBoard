// 수정: Auto — 2026-07-27 02:39 (금액 여러 건)
// 수정: Auto — 2026-07-27 02:17 (검사항목·결과·권고사항 컬럼)
// 수정: Auto — 2026-07-27 02:09

import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureEndoscopySchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS endoscopy_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope_type TEXT NOT NULL DEFAULT 'gastro',
        exam_date TEXT NOT NULL,
        exam_item TEXT NOT NULL DEFAULT '',
        result TEXT NOT NULL DEFAULT '',
        recommendation TEXT NOT NULL DEFAULT '',
        cost_items TEXT NOT NULL DEFAULT '[]',
        content TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      )`)
      const columns = [
        sql`ALTER TABLE endoscopy_records ADD COLUMN exam_item TEXT NOT NULL DEFAULT ''`,
        sql`ALTER TABLE endoscopy_records ADD COLUMN result TEXT NOT NULL DEFAULT ''`,
        sql`ALTER TABLE endoscopy_records ADD COLUMN recommendation TEXT NOT NULL DEFAULT ''`,
        sql`ALTER TABLE endoscopy_records ADD COLUMN cost_items TEXT NOT NULL DEFAULT '[]'`,
      ]
      for (const statement of columns) {
        try {
          await db.run(statement)
        } catch {
          // 이미 컬럼이 있으면 무시
        }
      }
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
