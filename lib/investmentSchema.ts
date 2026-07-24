// 수정: Auto — 2026-07-24 15:40 (종목 타입·배당 연동 컬럼)
// 수정: Auto — 2026-07-14 01:37 (예수금 수정 시각)

import { INVESTMENT_ACCOUNT_IDS } from '@/config/investmentAccounts'
import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureInvestmentSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS investment_account_cash (
        category TEXT PRIMARY KEY,
        cash_balance INTEGER NOT NULL DEFAULT 0,
        cash_balance_updated_at TEXT
      )`)
      await db.run(sql`CREATE TABLE IF NOT EXISTS investment_holdings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        market TEXT NOT NULL,
        purchase_price INTEGER NOT NULL,
        shares INTEGER NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`)

      for (const category of INVESTMENT_ACCOUNT_IDS) {
        await db.run(
          sql`INSERT OR IGNORE INTO investment_account_cash (category, cash_balance) VALUES (${category}, 0)`,
        )
      }

      try {
        await db.run(sql`ALTER TABLE investment_account_cash ADD COLUMN cash_balance_updated_at TEXT`)
      } catch {
        /* column already exists */
      }

      try {
        await db.run(
          sql`ALTER TABLE investment_holdings ADD COLUMN holding_type TEXT NOT NULL DEFAULT 'general'`,
        )
      } catch {
        /* column already exists */
      }
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
