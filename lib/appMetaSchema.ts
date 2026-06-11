// 수정: Auto — 2026-06-11

import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureAppMetaSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`)
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
