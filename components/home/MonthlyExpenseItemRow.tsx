'use client'
// 수정: Auto — 2026-06-08

import type { MonthlyExpense } from '@/hooks/useMonthlyExpenses'
import { formatWon } from '@/lib/annualPaymentCalc'
import { formatMonthlyDayLabel } from '@/lib/monthlyDayLabel'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type Props = {
  item: MonthlyExpense
  onEdit: () => void
}

const payTypeLabel = { card: '카드', cash: '현금' } as const
const payTypeColor = { card: 'primary', cash: 'secondary' } as const

export function MonthlyExpenseItemRow({ item, onEdit }: Props) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
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
      <Typography
        sx={{
          flex: 1,
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
