'use client'
// 수정: Auto — 2026-07-14 23:51

import type { DividendHolding } from '@/hooks/useDividends'
import { calcPortfolioYieldPercent, formatUsd, formatYieldPercent } from '@/lib/dividendCalc'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
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

const netKrwCellSx = {
  ...cellSx,
  fontWeight: { xs: 700, md: 700 },
} as const

const netKrwHeadSx = {
  ...headCellSx,
  fontWeight: { xs: 800, md: 700 },
} as const

const refHeadBg = (theme: Theme) => alpha(theme.palette.secondary.main, 0.1)
const netBg = (theme: Theme) => alpha(theme.palette.info.main, 0.08)
const taxBaseBg = (theme: Theme) => alpha(theme.palette.warning.main, 0.06)
const incomeBg = (theme: Theme) => alpha(theme.palette.primary.main, 0.06)

const netTotalCellSx = (theme: Theme) => ({
  ...netKrwCellSx,
  bgcolor: alpha(theme.palette.info.main, 0.16),
  color: theme.palette.info.dark,
})

const incomeTotalCellSx = (theme: Theme) => ({
  ...cellSx,
  fontWeight: { xs: 900, md: 700 },
  bgcolor: alpha(theme.palette.primary.main, 0.14),
  color: theme.palette.primary.dark,
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

function formatPerShare(row: DividendHolding) {
  if (row.market === 'domestic') {
    return row.perShareDividendKrw > 0 ? row.perShareDividendKrw.toLocaleString('ko-KR') : '—'
  }
  return row.perShareDividendUsd > 0 ? formatUsd(row.perShareDividendUsd) : '—'
}

function formatTaxBase(row: DividendHolding) {
  if (row.market !== 'domestic') return '—'
  return row.perShareTaxBaseKrw > 0 ? row.perShareTaxBaseKrw.toLocaleString('ko-KR') : '—'
}

export function DividendHoldingsCard({ holdings, onEdit }: Props) {
  const totals = useMemo(() => {
    const portfolioYield = calcPortfolioYieldPercent(holdings)

    let netKrw = 0
    let financialIncome = 0
    let hasKrw = false
    let hasIncome = false

    for (const row of holdings) {
      if (row.netKrw != null) {
        netKrw += row.netKrw
        hasKrw = true
      }
      const income = row.taxableKrw ?? row.grossKrw
      if (income != null) {
        financialIncome += income
        hasIncome = true
      }
    }

    return {
      portfolioYield,
      netKrw: hasKrw ? netKrw : null,
      financialIncome: hasIncome ? financialIncome : null,
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
        <Typography sx={{ flex: 1, minWidth: 0, fontWeight: 900, fontSize: '0.88rem' }}>
          보유 배당주
        </Typography>
        <Tooltip title="수정">
          <IconButton size="small" onClick={onEdit} aria-label="보유 배당주 수정">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table size="small" sx={{ minWidth: 360 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headCellSx, bgcolor: refHeadBg }}>종목</TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: refHeadBg }}>
                주
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: refHeadBg }}>
                배당률
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: refHeadBg }}>
                주당
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: taxBaseBg }}>
                과세표준
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: incomeBg }}>
                금융소득
              </TableCell>
              <TableCell align="right" sx={{ ...netKrwHeadSx, bgcolor: netBg }}>
                세후 원화
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holdings.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ ...cellSx, fontWeight: { xs: 900, md: 500 } }}>{row.ticker}</TableCell>
                <TableCell align="right" sx={cellSx}>
                  {row.defaultShares > 0 ? row.defaultShares : '—'}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, color: 'text.secondary' }}>
                  {formatYieldPercent(row.yieldPercent)}
                </TableCell>
                <TableCell align="right" sx={cellSx}>
                  {formatPerShare(row)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, bgcolor: taxBaseBg }}>
                  {formatTaxBase(row)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, bgcolor: incomeBg }}>
                  {formatKrwCell(row.taxableKrw ?? row.grossKrw)}
                </TableCell>
                <TableCell align="right" sx={{ ...netKrwCellSx, bgcolor: netBg }}>
                  {formatKrwCell(row.netKrw)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={totalLabelCellSx}>합계</TableCell>
              <TableCell align="right" sx={cellSx} />
              <TableCell align="right" sx={{ ...cellSx, color: 'text.secondary' }}>
                {formatYieldPercent(totals.portfolioYield)}
              </TableCell>
              <TableCell align="right" sx={cellSx} />
              <TableCell align="right" sx={cellSx} />
              <TableCell align="right" sx={incomeTotalCellSx}>
                {formatKrwCell(totals.financialIncome)}
              </TableCell>
              <TableCell align="right" sx={netTotalCellSx}>
                {formatKrwCell(totals.netKrw)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
