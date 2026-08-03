// 수정: Auto — 2026-08-03 10:21 (day 열 = 월별 G·보유 B 공통 width)
// 수정: Auto — 2026-08-03 10:13 (월별표 G(지급일) 열·금융소득/세후 width)
// 수정: Auto — 2026-07-25 01:07 (주 열 width 소폭 확대)
// 수정: Auto — 2026-07-25 01:04 (월별·보유 배당표 공통 포맷)
'use client'

import Box from '@mui/material/Box'
import { alpha, type Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'

export const dividendTableCellSx = {
  px: 0.25,
  py: 0.3,
  fontSize: '0.62rem',
  fontWeight: { xs: 700, md: 500 },
  lineHeight: 1.25,
  whiteSpace: 'nowrap',
  borderColor: 'divider',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const

export const dividendTableHeadCellSx = {
  ...dividendTableCellSx,
  fontWeight: { xs: 800, md: 500 },
  color: 'text.secondary',
  fontSize: '0.58rem',
} as const

export const dividendTableNetCellSx = {
  ...dividendTableCellSx,
  fontWeight: { xs: 700, md: 700 },
} as const

export const dividendTableNetHeadSx = {
  ...dividendTableHeadCellSx,
  fontWeight: { xs: 800, md: 700 },
} as const

/** $ · % 단위 — 숫자보다 약간 작게 */
export const dividendUnitSx = {
  fontSize: '0.82em',
  fontWeight: 600,
  opacity: 0.75,
  letterSpacing: '-0.02em',
  ml: '1px',
} as const

export const dividendIncomeBg = (theme: Theme) => alpha(theme.palette.primary.main, 0.08)
export const dividendNetBg = (theme: Theme) => alpha(theme.palette.success.main, 0.07)

export const dividendTableCol = {
  ticker: { width: '14%' },
  /** 월별 G(지급일) · 보유 B(기준일) 공통 */
  day: { width: '6%' },
  shares: { width: '10%' },
  perShare: { width: '13%' },
  yield: { width: '11%' },
  rate: { width: '11%' },
  income: { width: '17.5%' },
  net: { width: '17.5%' },
} as const

export function formatDividendKrwCell(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('ko-KR')
}

/** 주당 $ — 숫자 오른쪽 단위 */
export function formatDividendUsdCell(value: number): ReactNode {
  const n = value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return (
    <>
      {n}
      <Box component="span" sx={dividendUnitSx}>
        $
      </Box>
    </>
  )
}

/** 배당률 — 숫자 오른쪽 % */
export function formatDividendYieldCell(value: number | null): ReactNode {
  if (value == null) return '—'
  const n = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return (
    <>
      {n}
      <Box component="span" sx={dividendUnitSx}>
        %
      </Box>
    </>
  )
}

/** 환율 — 반올림 정수 */
export function formatDividendRateCell(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value) || !(value > 0)) return '—'
  return Math.round(value).toLocaleString('ko-KR')
}
