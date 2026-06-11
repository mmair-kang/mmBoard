// 수정: Auto — 2026-06-11

import { sql } from 'drizzle-orm'

import { ensureAppMetaSchema } from '@/lib/appMetaSchema'
import { db, getDbClient } from '@/lib/db'
import {
  defaultManageTabOrder,
  normalizeManageTabOrder,
  type ManageTabId,
} from '@/lib/manageTabOrder'

const SETTING_KEY = 'manage_tab_order'

export type ManageTabOrderData = {
  order: ManageTabId[]
  exists: boolean
}

export async function loadManageTabOrderData(): Promise<ManageTabOrderData> {
  await ensureAppMetaSchema()

  const result = await getDbClient().execute({
    sql: `SELECT value FROM app_meta WHERE key = ? LIMIT 1`,
    args: [SETTING_KEY],
  })

  const raw = result.rows[0]?.[0]
  if (typeof raw !== 'string') {
    return { order: defaultManageTabOrder(), exists: false }
  }

  try {
    return {
      order: normalizeManageTabOrder(JSON.parse(raw) as unknown),
      exists: true,
    }
  } catch {
    return { order: defaultManageTabOrder(), exists: false }
  }
}

export async function saveManageTabOrderData(order: ManageTabId[]): Promise<ManageTabOrderData> {
  await ensureAppMetaSchema()
  const normalized = normalizeManageTabOrder(order)
  const value = JSON.stringify(normalized)

  await db.run(sql`INSERT OR REPLACE INTO app_meta (key, value) VALUES (${SETTING_KEY}, ${value})`)

  return { order: normalized, exists: true }
}
