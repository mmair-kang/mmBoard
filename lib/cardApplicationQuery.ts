// 수정: Auto — 2026-07-13 01:23 (탈회 금지기간)
// 수정: Auto — 2026-07-13 01:19 (연회비)
// 수정: Auto — 2026-07-12 23:47 (신청불가 사유)
// 수정: Auto — 2026-07-12 23:36
import type { CardApplicationBlockedReason, CardApplicationPlatform } from '@/lib/cardApplicationPayload'
import type { cardApplications } from '@/lib/schema'

export type CardApplicationRow = typeof cardApplications.$inferSelect

export type CardApplication = {
  id: number
  platform: CardApplicationPlatform
  cardCompany: string
  cardName: string
  applicationBlocked: boolean
  blockedReason: CardApplicationBlockedReason | null
  blockedConfirmedDate: string | null
  annualFee: number
  spendAmount: number
  benefitAmount: number
  usageStartDate: string | null
  usageEndDate: string | null
  benefitDate: string | null
  withdrawalRestrictPeriod: string | null
  cancelDate: string | null
  createdAt: string
}

export function mapCardApplicationRow(row: CardApplicationRow): CardApplication {
  return {
    id: row.id,
    platform: row.platform as CardApplicationPlatform,
    cardCompany: row.cardCompany,
    cardName: row.cardName,
    applicationBlocked: row.applicationBlocked === 1,
    blockedReason: (row.blockedReason as CardApplicationBlockedReason | null) ?? null,
    blockedConfirmedDate: row.blockedConfirmedDate,
    annualFee: row.annualFee,
    spendAmount: row.spendAmount,
    benefitAmount: row.benefitAmount,
    usageStartDate: row.usageStartDate,
    usageEndDate: row.usageEndDate,
    benefitDate: row.benefitDate,
    withdrawalRestrictPeriod: row.withdrawalRestrictPeriod,
    cancelDate: row.cancelDate,
    createdAt: row.createdAt,
  }
}
