// 수정: Auto — 2026-07-27 02:39 (금액 여러 건)
// 수정: Auto — 2026-07-27 02:17 (검사항목·결과·권고사항 분리)
// 수정: Auto — 2026-07-27 02:09

import { parseEndoscopyScope, type HealthExamScopeId } from '@/lib/endoscopyTypes'
import { parseLastPurchaseDate } from '@/lib/shoppingDate'

export type EndoscopyCostItem = {
  label: string
  amount: number
}

export type EndoscopyRecordPayload = {
  scopeType: HealthExamScopeId
  examDate: string
  examItem: string
  result: string
  recommendation: string
  costItems: EndoscopyCostItem[]
}

export function parseEndoscopyCostItems(value: unknown): EndoscopyCostItem[] | null {
  if (value == null) return []
  if (typeof value === 'string') {
    try {
      return parseEndoscopyCostItems(JSON.parse(value) as unknown)
    } catch {
      return null
    }
  }
  if (!Array.isArray(value)) return null

  const items: EndoscopyCostItem[] = []
  for (const row of value) {
    if (!row || typeof row !== 'object') return null
    const record = row as Record<string, unknown>
    const label = typeof record.label === 'string' ? record.label.trim() : ''
    const amountRaw = record.amount
    const amount =
      typeof amountRaw === 'number'
        ? amountRaw
        : typeof amountRaw === 'string'
          ? Number(amountRaw.replace(/,/g, ''))
          : Number.NaN
    if (!label || !Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount)) {
      return null
    }
    items.push({ label, amount })
  }
  return items
}

export function serializeEndoscopyCostItems(items: EndoscopyCostItem[]): string {
  return JSON.stringify(items)
}

export function parseStoredEndoscopyCostItems(raw: string | null | undefined): EndoscopyCostItem[] {
  if (!raw) return []
  return parseEndoscopyCostItems(raw) ?? []
}

export function sumEndoscopyCostItems(items: EndoscopyCostItem[]): number {
  return items.reduce((sum, row) => sum + row.amount, 0)
}

export function parseEndoscopyRecordPayload(
  body: Record<string, unknown>,
): EndoscopyRecordPayload | null {
  const scopeType = parseEndoscopyScope(body.scopeType)
  if (!scopeType) return null

  const examDate = parseLastPurchaseDate(body.examDate)
  if (!examDate) return null

  const examItem = typeof body.examItem === 'string' ? body.examItem.trim() : ''
  const result = typeof body.result === 'string' ? body.result.trim() : ''
  const recommendation =
    typeof body.recommendation === 'string' ? body.recommendation.trim() : ''
  if (!examItem || !result) return null

  const costItems = parseEndoscopyCostItems(body.costItems)
  if (!costItems) return null

  return { scopeType, examDate, examItem, result, recommendation, costItems }
}
