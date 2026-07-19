'use client'
// 수정: Auto — 2026-07-19 16:15 (결제·카드 표시)

import type { MonthlyExpensePayType } from '@/hooks/useMonthlyExpenses'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type Props = {
  payType?: MonthlyExpensePayType
  cardTitle?: string | null
  labelWidth?: number
}

const payLabel = { card: '카드', cash: '현금' } as const

export function MonthlyExpensePayInfoRows({ payType = 'card', cardTitle, labelWidth = 88 }: Props) {
  return (
    <>
      <Stack
        direction="row"
        alignItems="flex-start"
        sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider', gap: 1 }}
      >
        <Typography
          sx={{
            width: labelWidth,
            flexShrink: 0,
            fontWeight: 700,
            fontSize: '0.8rem',
            color: 'text.secondary',
          }}
        >
          결제
        </Typography>
        <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '0.84rem', textAlign: 'right' }}>
          {payLabel[payType]}
        </Typography>
      </Stack>
      {payType === 'card' ? (
        <Stack
          direction="row"
          alignItems="flex-start"
          sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider', gap: 1 }}
        >
          <Typography
            sx={{
              width: labelWidth,
              flexShrink: 0,
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'text.secondary',
            }}
          >
            결제 카드
          </Typography>
          <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '0.84rem', textAlign: 'right' }}>
            {cardTitle?.trim() || '-'}
          </Typography>
        </Stack>
      ) : null}
    </>
  )
}
