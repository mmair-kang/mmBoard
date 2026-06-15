'use client'
// 수정: Auto — 2026-06-15 (PC 표 — 원(후)만 굵게)

import type { DividendEntry, DividendMonth } from '@/hooks/useDividends'
import { formatRate, formatUsd } from '@/lib/dividendCalc'
import { formatWon } from '@/lib/annualPaymentCalc'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Box from '@mui/material/Box'
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
import dayjs from 'dayjs'
import { useMemo } from 'react'

type Props = {
  month: DividendMonth
  onEdit: () => void
}

const TICKER_ORDER = ['JEPQ', 'GPIX']

const cellSx = {
  px: 0.45,
  py: 0.35,
  fontSize: '0.68rem',
  fontWeight: { xs: 700, md: 500 },
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  borderColor: 'divider',
} as const

const headCellSx = {
  ...cellSx,
  fontWeight: { xs: 800, md: 500 },
  color: 'text.secondary',
} as const

/** PC — 원(후) 열 */
const netKrwCellSx = {
  ...cellSx,
  fontWeight: { xs: 700, md: 700 },
} as const

const netKrwHeadSx = {
  ...headCellSx,
  fontWeight: { xs: 800, md: 700 },
} as const

const grossBg = (theme: Theme) => alpha(theme.palette.primary.main, 0.06)
const netBg = (theme: Theme) => alpha(theme.palette.success.main, 0.07)

const grossTotalCellSx = (theme: Theme) => ({
  ...cellSx,
  fontWeight: { xs: 900, md: 500 },
  bgcolor: alpha(theme.palette.primary.main, 0.16),
  color: theme.palette.primary.dark,
})

const netTotalCellSx = (theme: Theme) => ({
  ...netKrwCellSx,
  bgcolor: alpha(theme.palette.success.main, 0.16),
  color: theme.palette.success.dark,
})

const netUsdTotalCellSx = (theme: Theme) => ({
  ...cellSx,
  fontWeight: { xs: 900, md: 500 },
  bgcolor: alpha(theme.palette.success.main, 0.16),
  color: theme.palette.success.dark,
})

const totalLabelCellSx = {
  ...cellSx,
  fontWeight: { xs: 900, md: 500 },
  color: 'text.primary',
} as const

function sortEntries(entries: DividendEntry[]) {
  return [...entries].sort((a, b) => {
    const ai = TICKER_ORDER.indexOf(a.ticker)
    const bi = TICKER_ORDER.indexOf(b.ticker)
    const aRank = ai >= 0 ? ai : 99
    const bRank = bi >= 0 ? bi : 99
    if (aRank !== bRank) return aRank - bRank
    return a.dayOfMonth - b.dayOfMonth
  })
}

function formatKrwCell(value: number) {
  return value.toLocaleString('ko-KR')
}

export function DividendMonthCard({ month, onEdit }: Props) {
  const label = dayjs(`${month.yearMonth}-01`).format('YYYY년 M월')
  const { summary } = month
  const rows = useMemo(() => sortEntries(month.entries), [month.entries])

  const totals = useMemo(() => {
    let grossUsd = 0
    let netUsd = 0
    let grossKrw = 0
    let netKrw = 0

    for (const entry of rows) {
      grossUsd += entry.foreignSettlement + entry.foreignTax
      netUsd += entry.foreignSettlement
      grossKrw += entry.grossKrw
      netKrw += entry.dividendKrw
    }

    return { grossUsd, netUsd, grossKrw, netKrw }
  }, [rows])

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        minWidth: 0,
        overflow: 'hidden',
        borderColor: summary.overMonthlyLimit ? 'warning.main' : 'divider',
        bgcolor: (theme) =>
          summary.overMonthlyLimit ? alpha(theme.palette.warning.main, 0.06) : 'background.paper',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{ px: 1, py: 0.75, minWidth: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.25 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.88rem' }}>{label}</Typography>
            {summary.overMonthlyLimit ? (
              <Chip
                size="small"
                color="warning"
                label="한도초과"
                sx={{ height: 20, fontWeight: 800, fontSize: '0.62rem' }}
              />
            ) : null}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mt: 0.15 }}>
            금융소득 {formatWon(summary.financialIncome)}
          </Typography>
        </Box>
        <Tooltip title="수정">
          <IconButton size="small" onClick={onEdit} aria-label="수정" sx={{ flexShrink: 0 }}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table size="small" sx={{ minWidth: 480 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headCellSx, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.06) }}>
                종목
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...headCellSx, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.06) }}
              >
                주
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...headCellSx, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.06) }}
              >
                환율
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: grossBg }}>
                세전$
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: grossBg }}>
                주당(전)
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: grossBg }}>
                원(전)
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: netBg }}>
                세후$
              </TableCell>
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: netBg }}>
                주당(후)
              </TableCell>
              <TableCell align="right" sx={{ ...netKrwHeadSx, bgcolor: netBg }}>
                원(후)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell sx={cellSx}>
                  <Tooltip title={`${entry.dayOfMonth}일`}>
                    <span>{entry.ticker}</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" sx={cellSx}>
                  {entry.shares}
                </TableCell>
                <TableCell align="right" sx={cellSx}>
                  {formatRate(entry.exchangeRate)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, bgcolor: grossBg }}>
                  {formatUsd(entry.foreignSettlement + entry.foreignTax)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, bgcolor: grossBg }}>
                  {entry.perShareGrossForeign != null ? formatUsd(entry.perShareGrossForeign) : '—'}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, bgcolor: grossBg }}>
                  {formatKrwCell(entry.grossKrw)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, bgcolor: netBg }}>
                  {formatUsd(entry.foreignSettlement)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, bgcolor: netBg }}>
                  {entry.perShareForeign != null ? formatUsd(entry.perShareForeign) : '—'}
                </TableCell>
                <TableCell align="right" sx={{ ...netKrwCellSx, bgcolor: netBg }}>
                  {formatKrwCell(entry.dividendKrw)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={totalLabelCellSx}>합계</TableCell>
              <TableCell align="right" sx={cellSx} />
              <TableCell align="right" sx={cellSx} />
              <TableCell align="right" sx={grossTotalCellSx}>
                {formatUsd(totals.grossUsd)}
              </TableCell>
              <TableCell align="right" sx={cellSx} />
              <TableCell align="right" sx={grossTotalCellSx}>
                {formatKrwCell(totals.grossKrw)}
              </TableCell>
              <TableCell align="right" sx={netUsdTotalCellSx}>
                {formatUsd(totals.netUsd)}
              </TableCell>
              <TableCell align="right" sx={cellSx} />
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
