'use client'
// 수정: Auto — 2026-07-13 01:23 (탈회 금지기간)
// 수정: Auto — 2026-07-13 01:19 (연회비)
// 수정: Auto — 2026-07-13 01:14 (혜택 텍스트·달력 표시)
// 수정: Auto — 2026-07-13 00:12 (확인필요 상대 날짜)
// 수정: Auto — 2026-07-12 23:57 (확인필요)
// 수정: Auto — 2026-07-12 23:47 (신청불가: 혜택받음·사용중)
// 수정: Auto — 2026-07-12 23:46 (신청불가 확인 상대 날짜)
// 수정: Auto — 2026-07-12 23:44 (플랫폼 칩 복원)
// 수정: Auto — 2026-07-12 23:43 (목록 제목 순서: 카드사·카드명·플랫폼·신청불가)
// 수정: Auto — 2026-07-12 23:42 (카드명 없을 때 표시)
// 수정: Auto — 2026-07-12 23:36

import type { CardApplication } from '@/hooks/useCardApplications'
import {
  formatCardApplicationDateLabel,
  formatCardApplicationDateRangeLabel,
} from '@/lib/cardApplicationFormat'
import { formatCardApplicationBenefitDateLabel } from '@/lib/cardApplicationBenefitDate'
import {
  CARD_APPLICATION_BLOCKED_REASON_LABELS,
  CARD_APPLICATION_PLATFORM_LABELS,
  resolveCardApplicationBenefitReceivedDate,
  resolveCardApplicationBlockedReason,
  resolveCardApplicationNeedsCheckDate,
} from '@/lib/cardApplicationPayload'
import { formatWon } from '@/lib/monthlyTaskCardCalc'
import { formatRelativeDayKo } from '@/lib/relativeDayLabel'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type Props = {
  item: CardApplication
  onEdit: () => void
}

function RelativeDateLine({ label, value }: { label: string; value: string | null }) {
  const formatted = formatRelativeDayKo(value)
  if (!formatted) return null
  return (
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
      {label}{' '}
      <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
        {formatted}
      </Box>
    </Typography>
  )
}

function BenefitDateLine({ label, value }: { label: string; value: string | null }) {
  const formatted = formatCardApplicationBenefitDateLabel(value)
  if (!formatted) return null
  return (
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
      {label}{' '}
      <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
        {formatted}
      </Box>
    </Typography>
  )
}

function DateLine({ label, value }: { label: string; value: string | null }) {
  const formatted = formatCardApplicationDateLabel(value)
  if (!formatted) return null
  return (
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
      {label}{' '}
      <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
        {formatted}
      </Box>
    </Typography>
  )
}

const PLATFORM_COLOR = {
  naverpay: { main: '#03c75a', text: '#03a84d' },
  toss: { main: '#3182f6', text: '#1b64da' },
} as const

export function CardApplicationItemRow({ item, onEdit }: Props) {
  const usagePeriod = formatCardApplicationDateRangeLabel(item.usageStartDate, item.usageEndDate)
  const hasAmounts = item.annualFee > 0 || item.spendAmount > 0 || item.benefitAmount > 0
  const cardName = item.cardName.trim()
  const platformLabel = CARD_APPLICATION_PLATFORM_LABELS[item.platform]
  const blockedReason = resolveCardApplicationBlockedReason(item)
  const benefitReceivedDate = resolveCardApplicationBenefitReceivedDate(item)
  const needsCheckDate = resolveCardApplicationNeedsCheckDate(item)

  return (
    <Paper
      variant="outlined"
      onClick={onEdit}
      sx={{
        px: { xs: 1.1, md: 1.25 },
        py: { xs: 0.9, md: 1 },
        borderRadius: 1.75,
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: item.platform === 'naverpay' ? '#03c75a' : '#3182f6',
        cursor: 'pointer',
      }}
    >
      <Stack spacing={0.55}>
        <Stack direction="row" alignItems="center" spacing={0.6} sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              flex: 1,
              minWidth: 0,
              fontWeight: 800,
              fontSize: { xs: '0.88rem', md: '0.94rem' },
              lineHeight: 1.35,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.cardCompany}
            {cardName ? ` ${cardName}` : null}
          </Typography>
          <Chip
            size="small"
            label={platformLabel}
            sx={{
              height: 22,
              fontWeight: 800,
              fontSize: '0.66rem',
              flexShrink: 0,
              bgcolor: (theme) => alpha(PLATFORM_COLOR[item.platform].main, 0.1),
              color: PLATFORM_COLOR[item.platform].text,
            }}
          />
          {item.applicationBlocked ? (
            <Typography
              component="span"
              sx={{
                flexShrink: 0,
                fontWeight: 700,
                fontSize: { xs: '0.78rem', md: '0.82rem' },
                color: 'warning.dark',
                whiteSpace: 'nowrap',
              }}
            >
              신청불가
            </Typography>
          ) : null}
        </Stack>

        {hasAmounts ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {item.annualFee > 0 ? (
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                연회비 {formatWon(item.annualFee)}
              </Typography>
            ) : null}
            {item.spendAmount > 0 ? (
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                사용 {formatWon(item.spendAmount)}
              </Typography>
            ) : null}
            {item.benefitAmount > 0 ? (
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                혜택 {formatWon(item.benefitAmount)}
              </Typography>
            ) : null}
          </Stack>
        ) : null}

        {usagePeriod ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            사용기간{' '}
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
              {usagePeriod}
            </Box>
          </Typography>
        ) : null}

        <Stack spacing={0.15}>
          {item.applicationBlocked && blockedReason === 'benefit_received' ? (
            <RelativeDateLine label="혜택받음" value={benefitReceivedDate} />
          ) : null}
          {item.applicationBlocked && blockedReason === 'needs_check' ? (
            <RelativeDateLine label="확인필요" value={needsCheckDate} />
          ) : null}
          {item.applicationBlocked && blockedReason === 'in_use' ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
              {CARD_APPLICATION_BLOCKED_REASON_LABELS.in_use}
            </Typography>
          ) : null}
          {!item.applicationBlocked ? <BenefitDateLine label="혜택" value={item.benefitDate} /> : null}
          <BenefitDateLine label="탈회 금지" value={item.withdrawalRestrictPeriod} />
          <DateLine label="해지" value={item.cancelDate} />
        </Stack>
      </Stack>
    </Paper>
  )
}
