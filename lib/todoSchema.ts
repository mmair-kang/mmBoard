// 수정: Auto — 2026-06-11

import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureTodoSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS todo_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        due_date TEXT,
        due_time TEXT,
        created_at TEXT NOT NULL
      )`)
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
