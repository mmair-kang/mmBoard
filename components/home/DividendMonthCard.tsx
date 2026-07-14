'use client'
// 수정: Auto — 2026-07-15 01:00

import type { DividendEntry, DividendMonth } from '@/hooks/useDividends'
import { calcDividendEntry, formatRate, formatUsd } from '@/lib/dividendCalc'
import { DIVIDEND_TICKER_ORDER, isDomesticDividendTicker } from '@/lib/dividendHoldingsConfig'
import { formatWon } from '@/lib/annualPaymentCalc'
import Chip from '@mui/material/Chip'
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

const TICKER_ORDER = DIVIDEND_TICKER_ORDER

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

const netKrwCellSx = {
  ...cellSx,
  fontWeight: { xs: 700, md: 700 },
} as const

const netKrwHeadSx = {
  ...headCellSx,
  fontWeight: { xs: 800, md: 700 },
} as const

const perShareBg = (theme: Theme) => alpha(theme.palette.primary.main, 0.06)
const taxBaseBg = (theme: Theme) => alpha(theme.palette.warning.main, 0.06)
const incomeBg = (theme: Theme) => alpha(theme.palette.primary.main, 0.08)
const netBg = (theme: Theme) => alpha(theme.palette.success.main, 0.07)

const amountChipSx = {
  height: 20,
  fontWeight: 800,
  fontSize: '0.68rem',
  borderRadius: 1,
  '& .MuiChip-label': { px: 0.7, py: 0 },
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

function formatKrwCell(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('ko-KR')
}

function resolveFinancialIncome(entry: DividendEntry): number {
  if (entry.financialIncomeKrw != null && Number.isFinite(entry.financialIncomeKrw)) {
    return entry.financialIncomeKrw
  }
  return calcDividendEntry(entry).financialIncomeKrw
}

function formatPerShareDividend(entry: DividendEntry, domestic: boolean) {
  if (entry.perShareGrossForeign == null) return '—'
  return domestic
    ? Math.round(entry.perShareGrossForeign).toLocaleString('ko-KR')
    : formatUsd(entry.perShareGrossForeign)
}

function formatTaxBase(entry: DividendEntry, domestic: boolean) {
  if (!domestic || entry.perShareTaxBaseKrw == null || !(entry.perShareTaxBaseKrw > 0)) return '—'
  return entry.perShareTaxBaseKrw.toLocaleString('ko-KR')
}

export function DividendMonthCard({ month, onEdit }: Props) {
  const label = dayjs(`${month.yearMonth}-01`).format('YYYY년 M월')
  const { summary } = month
  const rows = useMemo(() => sortEntries(month.entries), [month.entries])

  const netKrwTotal = useMemo(
    () => rows.reduce((sum, entry) => sum + (entry.dividendKrw ?? 0), 0),
    [rows],
  )

  const financialIncomeTotal = useMemo(
    () => rows.reduce((sum, entry) => sum + resolveFinancialIncome(entry), 0),
    [rows],
  )

  const financialIncome = summary.financialIncome ?? financialIncomeTotal

  return (
    <Paper
      variant="outlined"
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit()
        }
      }}
      sx={{
        borderRadius: 2,
        minWidth: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        borderColor: summary.overMonthlyLimit ? 'warning.main' : 'divider',
        bgcolor: (theme) =>
          summary.overMonthlyLimit ? alpha(theme.palette.warning.main, 0.06) : 'background.paper',
        transition: 'border-color 0.15s',
        '&:hover': {
          borderColor: summary.overMonthlyLimit ? 'warning.dark' : 'primary.light',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ px: 1, py: 0.55, minWidth: 0, minHeight: 32, borderBottom: 1, borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={0.4} sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.84rem', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            {label}
          </Typography>
          {summary.overMonthlyLimit ? (
            <Chip
              size="small"
              color="warning"
              label="한도초과"
              sx={{ height: 18, fontWeight: 800, fontSize: '0.58rem', '& .MuiChip-label': { px: 0.55 } }}
            />
          ) : null}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.35}>
            <Typography
              component="span"
              sx={{ fontWeight: 700, fontSize: '0.62rem', color: 'text.secondary', lineHeight: 1 }}
            >
              금융소득
            </Typography>
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={formatWon(financialIncome)}
              sx={amountChipSx}
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.35}>
            <Typography
              component="span"
              sx={{ fontWeight: 700, fontSize: '0.62rem', color: 'text.secondary', lineHeight: 1 }}
            >
              세후
            </Typography>
            <Chip
              size="small"
              color="success"
              variant="outlined"
              label={formatWon(netKrwTotal)}
              sx={amountChipSx}
            />
          </Stack>
        </Stack>
      </Stack>

      <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table size="small" sx={{ minWidth: 360 }}>
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
              <TableCell align="right" sx={{ ...headCellSx, bgcolor: perShareBg }}>
                배당금
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
            {rows.map((entry) => {
              const domestic = isDomesticDividendTicker(entry.ticker)
              return (
                <TableRow key={entry.id} hover>
                  <TableCell sx={cellSx}>
                    <Tooltip title={`${entry.dayOfMonth}일`}>
                      <Stack direction="row" alignItems="center" spacing={0.35}>
                        <span>{entry.ticker}</span>
                        {domestic ? (
                          <Chip
                            size="small"
                            label="국내"
                            color="success"
                            variant="outlined"
                            sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700 }}
                          />
                        ) : null}
                      </Stack>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right" sx={cellSx}>
                    {entry.shares}
                  </TableCell>
                  <TableCell align="right" sx={cellSx}>
                    {domestic ? '—' : formatRate(entry.exchangeRate)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, bgcolor: perShareBg }}>
                    {formatPerShareDividend(entry, domestic)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, bgcolor: taxBaseBg }}>
                    {formatTaxBase(entry, domestic)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, bgcolor: incomeBg }}>
                    {formatKrwCell(resolveFinancialIncome(entry))}
                  </TableCell>
                  <TableCell align="right" sx={{ ...netKrwCellSx, bgcolor: netBg }}>
                    {formatKrwCell(entry.dividendKrw)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
