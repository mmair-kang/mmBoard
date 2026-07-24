'use client'
// 수정: Auto — 2026-07-25 01:08 (보유 배당주 보라→블랙 테마)
// 수정: Auto — 2026-07-25 01:04 ($ 우측·단위 크기·월별과 동일 표 포맷)
// 수정: Auto — 2026-07-25 00:57 (배당률 = 세후 원화 기준)
// 수정: Auto — 2026-07-25 00:54 (컬럼: 주·주당·배당률·환율·금융소득·세후)
// 수정: Auto — 2026-07-14 23:51

import {
  dividendIncomeBg,
  dividendNetBg,
  dividendTableCellSx,
  dividendTableCol,
  dividendTableHeadCellSx,
  dividendTableNetCellSx,
  dividendTableNetHeadSx,
  formatDividendKrwCell,
  formatDividendRateCell,
  formatDividendUsdCell,
  formatDividendYieldCell,
} from '@/components/home/dividendTableUi'
import type { DividendHolding } from '@/hooks/useDividends'
import { calcPortfolioYieldPercent } from '@/lib/dividendCalc'
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
import type { ReactNode } from 'react'
import { useMemo } from 'react'

type Props = {
  holdings: DividendHolding[]
  onEdit: () => void
}

const cellSx = dividendTableCellSx
const headCellSx = dividendTableHeadCellSx
const netKrwCellSx = dividendTableNetCellSx
const netKrwHeadSx = dividendTableNetHeadSx
const col = dividendTableCol
const incomeBg = dividendIncomeBg
const netBg = dividendNetBg

const headBg = (theme: Theme) => alpha(theme.palette.common.black, 0.05)

const netTotalCellSx = (theme: Theme) => ({
  ...netKrwCellSx,
  bgcolor: alpha(theme.palette.success.main, 0.16),
  color: theme.palette.success.dark,
  fontWeight: { xs: 900, md: 700 },
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

function formatPerShare(row: DividendHolding): ReactNode {
  if (row.market === 'domestic') {
    return row.perShareDividendKrw > 0 ? row.perShareDividendKrw.toLocaleString('ko-KR') : '—'
  }
  return row.perShareDividendUsd > 0 ? formatDividendUsdCell(row.perShareDividendUsd) : '—'
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
        borderColor: (theme) => alpha(theme.palette.common.black, 0.22),
        borderWidth: 1.5,
        bgcolor: (theme) => alpha(theme.palette.common.black, 0.02),
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
          bgcolor: (theme) => alpha(theme.palette.common.black, 0.06),
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

      <TableContainer sx={{ overflowX: 'hidden' }}>
        <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headCellSx, ...col.ticker, bgcolor: headBg }}>종목</TableCell>
              <TableCell align="right" sx={{ ...headCellSx, ...col.shares, bgcolor: headBg }}>
                주
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, ...col.perShare, bgcolor: headBg }}>
                주당
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, ...col.yield, bgcolor: headBg }}>
                배당률
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, ...col.rate, bgcolor: headBg }}>
                환율
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, ...col.income, bgcolor: incomeBg }}>
                금융소득
              </TableCell>
              <TableCell align="right" sx={{ ...netKrwHeadSx, ...col.net, bgcolor: netBg }}>
                세후
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holdings.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ ...cellSx, ...col.ticker, fontWeight: { xs: 900, md: 500 } }}>
                  {row.ticker}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, ...col.shares }}>
                  {row.defaultShares > 0 ? row.defaultShares : '—'}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, ...col.perShare }}>
                  {formatPerShare(row)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, ...col.yield, color: 'text.secondary' }}>
                  {formatDividendYieldCell(row.yieldPercent)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, ...col.rate }}>
                  {row.market === 'domestic' ? '—' : formatDividendRateCell(row.referenceExchangeRate)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, ...col.income, bgcolor: incomeBg }}>
                  {formatDividendKrwCell(row.taxableKrw ?? row.grossKrw)}
                </TableCell>
                <TableCell align="right" sx={{ ...netKrwCellSx, ...col.net, bgcolor: netBg }}>
                  {formatDividendKrwCell(row.netKrw)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ ...totalLabelCellSx, ...col.ticker }}>합계</TableCell>
              <TableCell align="right" sx={{ ...cellSx, ...col.shares }} />
              <TableCell align="right" sx={{ ...cellSx, ...col.perShare }} />
              <TableCell align="right" sx={{ ...cellSx, ...col.yield, color: 'text.secondary' }}>
                {formatDividendYieldCell(totals.portfolioYield)}
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, ...col.rate }} />
              <TableCell align="right" sx={(theme) => ({ ...incomeTotalCellSx(theme), ...col.income })}>
                {formatDividendKrwCell(totals.financialIncome)}
              </TableCell>
              <TableCell align="right" sx={(theme) => ({ ...netTotalCellSx(theme), ...col.net })}>
                {formatDividendKrwCell(totals.netKrw)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
