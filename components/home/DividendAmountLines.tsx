'use client'
// 수정: Auto — 2026-06-08

import { formatKrw } from '@/lib/dividendCalc'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type Props = {
  grossKrw: number
  dividendKrw: number
  emphasize?: boolean
}

const lineSx = {
  fontWeight: 700,
  lineHeight: 1.45,
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
} as const

export function DividendAmountLines({ grossKrw, dividendKrw, emphasize = false }: Props) {
  return (
    <Stack spacing={0.15} sx={{ minWidth: 0, width: '100%' }}>
      <Typography
        variant="caption"
        color={emphasize ? 'text.primary' : 'text.secondary'}
        sx={{ ...lineSx, fontWeight: emphasize ? 800 : 700 }}
      >
        배당금 세전 {formatKrw(grossKrw)}
      </Typography>
      <Typography
        variant="caption"
        color={emphasize ? 'text.primary' : 'text.secondary'}
        sx={{ ...lineSx, fontWeight: emphasize ? 800 : 700 }}
      >
        배당금 세후 {formatKrw(dividendKrw)}
      </Typography>
    </Stack>
  )
}
