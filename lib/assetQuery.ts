// 수정: Auto — 2026-07-14 01:26

import {
  DEFAULT_BOGEUMJARI_LOAN_RATE,
  DEFAULT_BOGEUMJARI_MONTHLY_PAYMENT,
  DEFAULT_BOGEUMJARI_PAYMENT_DAY,
  type AssetManualSettings,
} from '@/lib/assetCalc'
import { sql } from 'drizzle-orm'

import { ensureAppMetaSchema } from '@/lib/appMetaSchema'
import { db, getDbClient } from '@/lib/db'

const SETTING_KEY = 'asset_settings'

export type AssetSettingsData = AssetManualSettings & {
  exists: boolean
}

function defaultAssetSettings(): AssetManualSettings {
  return {
    apartmentValue: 0,
    apartmentValueUpdatedAt: null,
    bogeumjariLoan: 0,
    bogeumjariLoanUpdatedAt: null,
    bogeumjariLoanRate: DEFAULT_BOGEUMJARI_LOAN_RATE,
    bogeumjariMonthlyPayment: DEFAULT_BOGEUMJARI_MONTHLY_PAYMENT,
    bogeumjariPaymentDay: DEFAULT_BOGEUMJARI_PAYMENT_DAY,
  }
}

function parseLoanRate(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_BOGEUMJARI_LOAN_RATE
  return Math.round(Math.min(100, Math.max(0, value)) * 100) / 100
}

function parsePaymentDay(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_BOGEUMJARI_PAYMENT_DAY
  return Math.min(31, Math.max(1, Math.round(value)))
}

function parseMonthlyPayment(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_BOGEUMJARI_MONTHLY_PAYMENT
  return Math.max(0, Math.round(value))
}

function parseAssetSettings(raw: unknown): AssetManualSettings {
  if (!raw || typeof raw !== 'object') return defaultAssetSettings()

  const body = raw as Record<string, unknown>
  const apartmentValue = typeof body.apartmentValue === 'number' && Number.isFinite(body.apartmentValue)
    ? Math.max(0, Math.round(body.apartmentValue))
    : 0
  const bogeumjariLoan = typeof body.bogeumjariLoan === 'number' && Number.isFinite(body.bogeumjariLoan)
    ? Math.max(0, Math.round(body.bogeumjariLoan))
    : 0
  const apartmentValueUpdatedAt =
    typeof body.apartmentValueUpdatedAt === 'string' ? body.apartmentValueUpdatedAt : null
  const bogeumjariLoanUpdatedAt =
    typeof body.bogeumjariLoanUpdatedAt === 'string' ? body.bogeumjariLoanUpdatedAt : null

  return {
    apartmentValue,
    apartmentValueUpdatedAt,
    bogeumjariLoan,
    bogeumjariLoanUpdatedAt,
    bogeumjariLoanRate: parseLoanRate(body.bogeumjariLoanRate),
    bogeumjariMonthlyPayment: parseMonthlyPayment(body.bogeumjariMonthlyPayment),
    bogeumjariPaymentDay: parsePaymentDay(body.bogeumjariPaymentDay),
  }
}

export async function loadAssetSettingsData(): Promise<AssetSettingsData> {
  await ensureAppMetaSchema()

  const result = await getDbClient().execute({
    sql: `SELECT value FROM app_meta WHERE key = ? LIMIT 1`,
    args: [SETTING_KEY],
  })

  const raw = result.rows[0]?.[0]
  if (typeof raw !== 'string') {
    return { ...defaultAssetSettings(), exists: false }
  }

  try {
    return {
      ...parseAssetSettings(JSON.parse(raw) as unknown),
      exists: true,
    }
  } catch {
    return { ...defaultAssetSettings(), exists: false }
  }
}

export async function saveAssetSettingsData(
  partial: Partial<AssetManualSettings>,
): Promise<AssetSettingsData> {
  await ensureAppMetaSchema()

  const current = await loadAssetSettingsData()
  const now = new Date().toISOString()
  const next: AssetManualSettings = {
    apartmentValue: partial.apartmentValue ?? current.apartmentValue,
    apartmentValueUpdatedAt: current.apartmentValueUpdatedAt,
    bogeumjariLoan: partial.bogeumjariLoan ?? current.bogeumjariLoan,
    bogeumjariLoanUpdatedAt: current.bogeumjariLoanUpdatedAt,
    bogeumjariLoanRate: partial.bogeumjariLoanRate ?? current.bogeumjariLoanRate,
    bogeumjariMonthlyPayment: partial.bogeumjariMonthlyPayment ?? current.bogeumjariMonthlyPayment,
    bogeumjariPaymentDay: partial.bogeumjariPaymentDay ?? current.bogeumjariPaymentDay,
  }

  if (partial.apartmentValue !== undefined) {
    next.apartmentValueUpdatedAt = now
  }
  if (partial.bogeumjariLoan !== undefined) {
    next.bogeumjariLoanUpdatedAt = now
  }

  const value = JSON.stringify(next)

  await db.run(sql`INSERT OR REPLACE INTO app_meta (key, value) VALUES (${SETTING_KEY}, ${value})`)

  return { ...next, exists: true }
}
