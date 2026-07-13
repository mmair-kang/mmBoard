'use client'
// 수정: Auto — 2026-07-14 02:00

import type { DividendHolding } from '@/hooks/useDividends'
import { calcPortfolioYieldPercent, formatUsd, formatYieldPercent } from '@/lib/dividendCalc'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'
import { useMemo } from 'react'

type Props = {
  holdings: DividendHolding[]
  onEdit: () => void
}

const cellBase = {
  px: 0.45,
  py: 0.35,
  fontSize: '0.68rem',
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  borderColor: 'divider',
} as const

const cellSx = {
  ...cellBase,
  fontWeight: { xs: 700, md: 500 },
} as const

const headCellSx = {
  ...cellBase,
  fontWeight: { xs: 800, md: 500 },
  color: 'text.secondary',
} as const

const priceCellSx = {
  ...cellSx,
  color: 'secondary.dark',
  fontWeight: { xs: 800, md: 700 },
} as const

const priceHeadSx = {
  ...headCellSx,
  fontWeight: { xs: 800, md: 700 },
} as const

const netKrwCellSx = {
  ...cellSx,
  fontWeight: { xs: 700, md: 700 },
} as const

const netKrwHeadSx = {
  ...headCellSx,
  fontWeight: { xs: 800, md: 700 },
} as const

const refHeadBg = (theme: Theme) => alpha(theme.palette.secondary.main, 0.1)
const grossBg = (theme: Theme) => alpha(theme.palette.secondary.main, 0.06)
const netBg = (theme: Theme) => alpha(theme.palette.info.main, 0.08)
const usdBg = (theme: Theme) => alpha(theme.palette.action.hover, 0.04)
const domesticBg = (theme: Theme) => alpha(theme.palette.success.main, 0.06)

const grossTotalCellSx = (theme: Theme) => ({
  ...cellSx,
  fontWeight: { xs: 900, md: 500 },
  bgcolor: alpha(theme.palette.secondary.main, 0.16),
  color: theme.palette.secondary.dark,
})

const netTotalCellSx = (theme: Theme) => ({
  ...netKrwCellSx,
  bgcolor: alpha(theme.palette.info.main, 0.16),
  color: theme.palette.info.dark,
})

const grossUsdTotalCellSx = (theme: Theme) => ({
  ...cellSx,
  fontWeight: { xs: 900, md: 500 },
  bgcolor: alpha(theme.palette.secondary.main, 0.12),
  color: theme.palette.secondary.dark,
})

const netUsdTotalCellSx = (theme: Theme) => ({
  ...cellSx,
  fontWeight: { xs: 900, md: 500 },
  bgcolor: alpha(theme.palette.info.main, 0.12),
  color: theme.palette.info.dark,
})

const totalLabelCellSx = {
  ...cellSx,
  fontWeight: { xs: 900, md: 500 },
  color: { xs: 'text.primary', md: 'text.secondary' },
} as const

function formatKrwCell(value: number | null) {
  if (value == null) return '—'
  return value.toLocaleString('ko-KR')
}

function formatUsdCell(value: number, ready: boolean) {
  if (!ready) return '—'
  return formatUsd(value)
}

function isRowReady(row: DividendHolding) {
  if (row.defaultShares <= 0) return false
  return row.market === 'domestic' ? row.perShareDividendKrw > 0 : row.perShareDividendUsd > 0
}

function formatPrice(row: DividendHolding) {
  if (row.market === 'domestic') {
    return row.livePriceKrw != null ? row.livePriceKrw.toLocaleString('ko-KR') : '—'
  }
  return row.livePriceUsd != null ? formatUsd(row.livePriceUsd) : '—'
}

function formatPerShare(row: DividendHolding) {
  if (row.market === 'domestic') {
    return row.perShareDividendKrw > 0 ? row.perShareDividendKrw.toLocaleString('ko-KR') : '—'
  }
  return row.perShareDividendUsd > 0 ? formatUsd(row.perShareDividendUsd) : '—'
}

export function DividendHoldingsCard({ holdings, onEdit }: Props) {
  const totals = useMemo(() => {
    const portfolioYield = calcPortfolioYieldPercent(holdings)

    let grossKrw = 0
    let netKrw = 0
    let grossUsd = 0
    let netUsd = 0
    let hasKrw = false
    let hasUsd = false

    for (const row of holdings) {
      if (row.grossKrw != null) {
        grossKrw += row.grossKrw
        hasKrw = true
      }
      if (row.netKrw != null) {
        netKrw += row.netKrw
      }
      if (row.market === 'overseas' && row.defaultShares > 0 && row.perShareDividendUsd > 0) {
        grossUsd += row.grossMonthlyUsd
        netUsd += row.netMonthlyUsd
        hasUsd = true
      }
    }

    return {
      portfolioYield,
      grossKrw: hasKrw ? grossKrw : null,
      netKrw: hasKrw ? netKrw : null,
      grossUsd,
      netUsd,
      hasUsd,
    }
  }, [holdings])

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        minWidth: 0,
        overflow: 'hidden',
        borderColor: 'secondary.light',
        borderWidth: 1.5,
        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.03),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          px: 1,
          py: 0.7,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.88rem' }}>보유 참고</Typography>
          <Chip
            size="small"
            label="예상"
            color="secondary"
            sx={{ height: 20, fontWeight: 800, fontSize: '0.62rem' }}
          />
        </Stack>
        <Tooltip title="수정">
          <IconButton size="small" onClick={onEdit} aria-label="보유 참고 수정">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headCellSx, bgcolor: refHeadBg }}>종목</TableCell>
              <TableCell sx={{ ...headCellSx, bgcolor: refHeadBg }}>시장</TableCell>
              <TableCell align="right" sx={{ ...priceHeadSx, bgcolor: refHeadBg }}>
                주가
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: refHeadBg }}>
                주
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: refHeadBg }}>
                배당률
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: refHeadBg }}>
                주당
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: grossBg }}>
                원(전)
              </TableCell>
              <TableCell align="right" sx={{ ...netKrwHeadSx, bgcolor: netBg }}>
                원(후)
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: usdBg }}>
                세전$
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: usdBg }}>
                세후$
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holdings.map((row) => {
              const ready = isRowReady(row)
              const isDomestic = row.market === 'domestic'
              return (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ ...cellSx, fontWeight: { xs: 900, md: 500 } }}>
                    <Stack spacing={0.1}>
                      <span>{row.ticker}</span>
                      {isDomestic ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.58rem', fontWeight: 600, lineHeight: 1.2 }}
                        >
                          위클리커버드콜
                        </Typography>
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ ...cellSx, bgcolor: isDomestic ? domesticBg : undefined }}>
                    <Chip
                      size="small"
                      label={isDomestic ? '국내' : '해외'}
                      color={isDomestic ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.58rem', fontWeight: 800 }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={priceCellSx}>
                    {formatPrice(row)}
                  </TableCell>
                  <TableCell align="right" sx={cellSx}>
                    {row.defaultShares > 0 ? row.defaultShares : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, color: 'text.secondary' }}>
                    {formatYieldPercent(row.yieldPercent)}
                  </TableCell>
                  <TableCell align="right" sx={cellSx}>
                    {formatPerShare(row)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, bgcolor: grossBg }}>
                    {formatKrwCell(row.grossKrw)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...netKrwCellSx, bgcolor: netBg }}>
                    {formatKrwCell(row.netKrw)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, bgcolor: usdBg }}>
                    {isDomestic ? '—' : formatUsdCell(row.grossMonthlyUsd, ready)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, bgcolor: usdBg }}>
                    {isDomestic ? '—' : formatUsdCell(row.netMonthlyUsd, ready)}
                  </TableCell>
                </TableRow>
              )
            })}
            <TableRow>
              <TableCell sx={totalLabelCellSx}>합계</TableCell>
              <TableCell sx={cellSx} />
              <TableCell align="right" sx={cellSx} />
              <TableCell align="right" sx={cellSx} />
              <TableCell align="right" sx={{ ...cellSx, color: 'text.secondary' }}>
                {formatYieldPercent(totals.portfolioYield)}
              </TableCell>
              <TableCell align="right" sx={cellSx} />
              <TableCell align="right" sx={grossTotalCellSx}>
                {formatKrwCell(totals.grossKrw)}
              </TableCell>
              <TableCell align="right" sx={netTotalCellSx}>
                {formatKrwCell(totals.netKrw)}
              </TableCell>
              <TableCell align="right" sx={grossUsdTotalCellSx}>
                {totals.hasUsd ? formatUsd(totals.grossUsd) : '—'}
              </TableCell>
              <TableCell align="right" sx={netUsdTotalCellSx}>
                {totals.hasUsd ? formatUsd(totals.netUsd) : '—'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
