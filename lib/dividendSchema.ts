// 수정: Auto — 2026-06-08
import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { dividendHoldings } from '@/lib/schema'

const DEFAULT_TICKERS = ['JEPQ', 'GPIX'] as const

let schemaReady: Promise<void> | null = null

export async function ensureDividendSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS dividend_holdings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker TEXT NOT NULL UNIQUE,
        default_shares INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0
      )`)

      await db.run(sql`CREATE TABLE IF NOT EXISTS dividend_months (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year_month TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      )`)

      await db.run(sql`CREATE TABLE IF NOT EXISTS dividend_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        month_id INTEGER NOT NULL,
        day_of_month INTEGER NOT NULL,
        ticker TEXT NOT NULL,
        shares INTEGER NOT NULL DEFAULT 0,
        exchange_rate REAL NOT NULL,
        foreign_settlement REAL NOT NULL,
        foreign_tax REAL NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      )`)

      try {
        await db.run(
          sql`ALTER TABLE dividend_holdings ADD COLUMN per_share_dividend_usd REAL NOT NULL DEFAULT 0`,
        )
      } catch {
        /* column exists */
      }
      try {
        await db.run(
          sql`ALTER TABLE dividend_holdings ADD COLUMN reference_price_usd REAL NOT NULL DEFAULT 0`,
        )
      } catch {
        /* column exists */
      }
      try {
        await db.run(
          sql`ALTER TABLE dividend_holdings ADD COLUMN reference_exchange_rate REAL NOT NULL DEFAULT 0`,
        )
      } catch {
        /* column exists */
      }

      const existing = await db.select().from(dividendHoldings).limit(1)
      if (existing.length === 0) {
        for (let i = 0; i < DEFAULT_TICKERS.length; i++) {
          await db.run(
            sql`INSERT INTO dividend_holdings (ticker, default_shares, sort_order) VALUES (${DEFAULT_TICKERS[i]}, 0, ${i})`,
          )
        }
      }
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
