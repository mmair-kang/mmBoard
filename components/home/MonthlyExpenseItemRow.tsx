'use client'
// 수정: Auto — 2026-07-19 13:10 (보금자리론 정보 아이콘)
// 수정: Auto — 2026-07-19 03:30 (국민연금 정보 아이콘)
// 수정: Auto — 2026-07-19 03:15 (건보 고지서 정보 아이콘)
// 수정: Auto — 2026-07-19 03:25 (상세 타입 정보 아이콘)
// 수정: Auto — 2026-07-19 03:20 (정보 아이콘을 이름 옆으로)
// 수정: Auto — 2026-07-19 03:15 (통신비 정보 아이콘)

import type { MonthlyExpense } from '@/hooks/useMonthlyExpenses'
import { formatWon } from '@/lib/annualPaymentCalc'
import { formatMonthlyDayLabel } from '@/lib/monthlyDayLabel'
import {
  getMonthlyExpenseTypeLabel,
  hasExpenseDetailType,
  hasSectionExpenseDetailType,
} from '@/lib/telecomExpenseDetail'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type Props = {
  item: MonthlyExpense
  onEdit: () => void
  onOpenDetailInfo?: () => void
}

const payTypeLabel = { card: '카드', cash: '현금' } as const
const payTypeColor = { card: 'primary', cash: 'secondary' } as const

function hasDetailPayload(item: MonthlyExpense): boolean {
  if (hasSectionExpenseDetailType(item.expenseType)) return item.telecomDetail != null
  if (item.expenseType === 'healthInsurance') return item.healthInsuranceDetail != null
  if (item.expenseType === 'nationalPension') return item.nationalPensionDetail != null
  if (item.expenseType === 'insurance') return item.insuranceDetail != null
  if (item.expenseType === 'rental') return item.rentalDetail != null
  if (item.expenseType === 'bogeumjari') return item.bogeumjariDetail != null
  return false
}

export function MonthlyExpenseItemRow({ item, onEdit, onOpenDetailInfo }: Props) {
  const showDetailInfo = hasExpenseDetailType(item.expenseType) && hasDetailPayload(item)
  const detailAria = hasExpenseDetailType(item.expenseType)
    ? `${getMonthlyExpenseTypeLabel(item.expenseType)} 내역 보기`
    : '상세 내역 보기'

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      onClick={() => onEdit()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit()
        }
      }}
      sx={{
        px: 1,
        py: 0.65,
        borderRadius: 1.5,
        border: 1,
        borderColor: 'divider',
        cursor: 'pointer',
        bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
        '&:active': { opacity: 0.85 },
      }}
    >
      <Chip
        size="small"
        label={formatMonthlyDayLabel(item.dayOfMonth)}
        sx={{ height: 22, fontWeight: 800, fontSize: '0.68rem', flexShrink: 0 }}
        variant="outlined"
        color="primary"
      />
      <Stack direction="row" alignItems="center" spacing={0.15} sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            minWidth: 0,
            fontWeight: 700,
            fontSize: '0.84rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title}
        </Typography>
        {showDetailInfo ? (
          <IconButton
            size="small"
            aria-label={detailAria}
            onClick={(e) => {
              e.stopPropagation()
              onOpenDetailInfo?.()
            }}
            sx={{ color: 'text.secondary', p: 0.25, flexShrink: 0 }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        ) : null}
      </Stack>
      <Chip
        size="small"
        label={payTypeLabel[item.payType]}
        color={payTypeColor[item.payType]}
        sx={{ height: 22, fontWeight: 800, fontSize: '0.65rem', flexShrink: 0 }}
      />
      <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {formatWon(item.amount)}
      </Typography>
    </Stack>
  )
}
