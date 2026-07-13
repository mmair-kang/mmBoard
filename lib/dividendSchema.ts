// 수정: Auto — 2026-07-14 02:00
import { sql } from 'drizzle-orm'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { DIVIDEND_HOLDING_SEEDS } from '@/lib/dividendHoldingsConfig'
import { dividendHoldings } from '@/lib/schema'

let schemaReady: Promise<void> | null = null

async function ensureColumn(ddl: string) {
  try {
    await db.run(sql.raw(ddl))
  } catch {
    /* column exists */
  }
}

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

      await ensureColumn(
        `ALTER TABLE dividend_holdings ADD COLUMN per_share_dividend_usd REAL NOT NULL DEFAULT 0`,
      )
      await ensureColumn(
        `ALTER TABLE dividend_holdings ADD COLUMN reference_price_usd REAL NOT NULL DEFAULT 0`,
      )
      await ensureColumn(
        `ALTER TABLE dividend_holdings ADD COLUMN reference_exchange_rate REAL NOT NULL DEFAULT 0`,
      )
      await ensureColumn(`ALTER TABLE dividend_holdings ADD COLUMN market TEXT NOT NULL DEFAULT 'overseas'`)
      await ensureColumn(`ALTER TABLE dividend_holdings ADD COLUMN quote_symbol TEXT NOT NULL DEFAULT ''`)
      await ensureColumn(
        `ALTER TABLE dividend_holdings ADD COLUMN per_share_dividend_krw REAL NOT NULL DEFAULT 0`,
      )
      await ensureColumn(
        `ALTER TABLE dividend_holdings ADD COLUMN reference_price_krw REAL NOT NULL DEFAULT 0`,
      )

      const existing = await db.select().from(dividendHoldings)
      const existingByTicker = new Map(existing.map((row) => [row.ticker.toUpperCase(), row]))

      if (existing.length === 0) {
        for (let i = 0; i < DIVIDEND_HOLDING_SEEDS.length; i++) {
          const seed = DIVIDEND_HOLDING_SEEDS[i]
          await db.run(
            sql`INSERT INTO dividend_holdings (
              ticker, market, quote_symbol, default_shares, sort_order
            ) VALUES (
              ${seed.ticker}, ${seed.market}, ${seed.quoteSymbol}, ${seed.defaultShares ?? 0}, ${i}
            )`,
          )
        }
        return
      }

      for (let i = 0; i < DIVIDEND_HOLDING_SEEDS.length; i++) {
        const seed = DIVIDEND_HOLDING_SEEDS[i]
        const row = existingByTicker.get(seed.ticker)
        if (!row) {
          await db.insert(dividendHoldings).values({
            ticker: seed.ticker,
            market: seed.market,
            quoteSymbol: seed.quoteSymbol,
            defaultShares: seed.defaultShares ?? 0,
            sortOrder: i,
          })
          continue
        }

        const patch: Record<string, unknown> = { sortOrder: i }
        if (!row.quoteSymbol) patch.quoteSymbol = seed.quoteSymbol
        if (row.market !== seed.market) patch.market = seed.market
        if (seed.defaultShares != null && row.defaultShares === 0) {
          patch.defaultShares = seed.defaultShares
        }

        if (Object.keys(patch).length > 0) {
          await db.update(dividendHoldings).set(patch).where(eq(dividendHoldings.id, row.id))
        }
      }
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  await schemaReady
}
