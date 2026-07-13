// 수정: Auto — 2026-07-13 01:23 (탈회 금지기간)
// 수정: Auto — 2026-07-13 01:19 (연회비)
// 수정: Auto — 2026-07-13 01:14 (혜택받는 날짜 텍스트)
// 수정: Auto — 2026-07-13 00:12 (확인필요 확인한 날짜)
// 수정: Auto — 2026-07-12 23:57 (확인필요)
// 수정: Auto — 2026-07-12 23:42 (카드명 선택 입력)
// 수정: Auto — 2026-07-12 23:36
import { isCardApplicationIsoBenefitDate, parseCardApplicationBenefitDate } from '@/lib/cardApplicationBenefitDate'
import { parseLastPurchaseDate } from '@/lib/shoppingDate'

export const CARD_APPLICATION_PLATFORMS = ['naverpay', 'toss'] as const
export type CardApplicationPlatform = (typeof CARD_APPLICATION_PLATFORMS)[number]

export const CARD_APPLICATION_PLATFORM_LABELS: Record<CardApplicationPlatform, string> = {
  naverpay: '네이버페이',
  toss: '토스',
}

export const CARD_APPLICATION_BLOCKED_REASONS = ['benefit_received', 'in_use', 'needs_check'] as const
export type CardApplicationBlockedReason = (typeof CARD_APPLICATION_BLOCKED_REASONS)[number]

export const CARD_APPLICATION_BLOCKED_REASON_LABELS: Record<CardApplicationBlockedReason, string> = {
  benefit_received: '혜택받음',
  in_use: '사용중',
  needs_check: '확인필요',
}

const platformSet = new Set<string>(CARD_APPLICATION_PLATFORMS)
const blockedReasonSet = new Set<string>(CARD_APPLICATION_BLOCKED_REASONS)

export type CardApplicationPayload = {
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
}

function parseOptionalDate(value: unknown): string | null {
  if (value == null || value === '') return null
  return parseLastPurchaseDate(value)
}

function parseAmount(value: unknown): number {
  if (value == null || value === '') return 0
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) return -1
  return Math.round(num)
}

export function parseCardApplicationPayload(body: Record<string, unknown>): CardApplicationPayload | null {
  const platform = String(body.platform ?? '')
  const cardCompany = typeof body.cardCompany === 'string' ? body.cardCompany.trim() : ''
  const cardName = typeof body.cardName === 'string' ? body.cardName.trim() : ''
  const applicationBlocked = Boolean(body.applicationBlocked)
  const blockedReasonRaw = body.blockedReason == null || body.blockedReason === '' ? null : String(body.blockedReason)
  const blockedConfirmedDate = parseOptionalDate(body.blockedConfirmedDate)
  const annualFee = parseAmount(body.annualFee)
  const spendAmount = parseAmount(body.spendAmount)
  const benefitAmount = parseAmount(body.benefitAmount)
  const usageStartDate = parseOptionalDate(body.usageStartDate)
  const usageEndDate = parseOptionalDate(body.usageEndDate)
  const benefitDateRaw = body.benefitDate
  const withdrawalRestrictPeriodRaw = body.withdrawalRestrictPeriod
  const cancelDate = parseOptionalDate(body.cancelDate)

  if (!platformSet.has(platform)) return null
  if (!cardCompany) return null
  if (annualFee < 0 || spendAmount < 0 || benefitAmount < 0) return null

  let blockedReason: CardApplicationBlockedReason | null = null
  let benefitDate: string | null = null
  const withdrawalRestrictPeriod = parseCardApplicationBenefitDate(withdrawalRestrictPeriodRaw, false)
  if (applicationBlocked) {
    if (!blockedReasonRaw || !blockedReasonSet.has(blockedReasonRaw)) return null
    blockedReason = blockedReasonRaw as CardApplicationBlockedReason
    if (blockedReason === 'benefit_received') {
      benefitDate = parseCardApplicationBenefitDate(benefitDateRaw, true)
      if (!benefitDate) return null
    }
    if (blockedReason === 'needs_check' && !blockedConfirmedDate) return null
  } else {
    benefitDate = parseCardApplicationBenefitDate(benefitDateRaw, false)
  }

  return {
    platform: platform as CardApplicationPlatform,
    cardCompany,
    cardName,
    applicationBlocked,
    blockedReason: applicationBlocked ? blockedReason : null,
    blockedConfirmedDate:
      applicationBlocked && blockedReason === 'needs_check' ? blockedConfirmedDate : null,
    annualFee,
    spendAmount,
    benefitAmount,
    usageStartDate,
    usageEndDate,
    benefitDate: applicationBlocked
      ? blockedReason === 'benefit_received'
        ? benefitDate
        : null
      : benefitDate,
    withdrawalRestrictPeriod,
    cancelDate,
  }
}

export function resolveCardApplicationBlockedReason(
  item: Pick<CardApplicationPayload, 'applicationBlocked' | 'blockedReason' | 'blockedConfirmedDate' | 'benefitDate'>,
): CardApplicationBlockedReason | null {
  if (!item.applicationBlocked) return null
  if (item.blockedReason) return item.blockedReason
  if (item.benefitDate && isCardApplicationIsoBenefitDate(item.benefitDate)) return 'benefit_received'
  if (item.blockedConfirmedDate) return 'needs_check'
  return 'in_use'
}

export function resolveCardApplicationBenefitReceivedDate(
  item: Pick<CardApplicationPayload, 'benefitDate' | 'blockedConfirmedDate'>,
): string | null {
  return item.benefitDate ?? null
}

export function resolveCardApplicationNeedsCheckDate(
  item: Pick<CardApplicationPayload, 'blockedConfirmedDate'>,
): string | null {
  return item.blockedConfirmedDate
}
