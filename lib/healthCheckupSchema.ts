// 수정: Auto — 2026-07-27 01:56

import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureHealthCheckupSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS health_checkups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checkup_date TEXT NOT NULL,
        age INTEGER,
        height_cm REAL,
        weight_kg REAL,
        bmi REAL,
        waist_cm REAL,
        vision_left REAL,
        vision_right REAL,
        bp_systolic INTEGER,
        bp_diastolic INTEGER,
        fasting_glucose REAL,
        total_cholesterol REAL,
        hdl REAL,
        triglycerides REAL,
        ldl REAL,
        created_at TEXT NOT NULL
      )`)
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
