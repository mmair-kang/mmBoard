'use client'
// 수정: Auto — 2026-07-25 01:04 ($ 우측·단위 크기·보유표 동일 포맷)
// 수정: Auto — 2026-07-25 01:02 (월별 표 가로 스크롤 없이 맞춤·$/% 축소)
// 수정: Auto — 2026-07-25 01:01 (월별 표 환율 반올림·정수 표시)
// 수정: Auto — 2026-07-25 00:57 (배당률 = 세후 원화 기준)
// 수정: Auto — 2026-07-25 00:54 (컬럼: 주·주당·배당률·환율·금융소득·세후)
// 수정: Auto — 2026-07-24 23:53 (월별 표 세전·과세표준 열 숨김)
// 수정: Auto — 2026-07-24 23:50 (월별 표 국내칩 제거)
// 수정: Auto — 2026-07-24 18:25 (세전·세후 원화 표기)
// 수정: Auto — 2026-07-15 01:00

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
import type { DividendEntry, DividendHolding, DividendMonth } from '@/hooks/useDividends'
import {
  calcAnnualDividendYieldPercent,
  calcDividendEntry,
  formatUsd,
  resolveHoldingPriceKrw,
  resolveHoldingPriceUsd,
} from '@/lib/dividendCalc'
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
import { alpha } from '@mui/material/styles'
import dayjs from 'dayjs'
import { useMemo } from 'react'

type Props = {
  month: DividendMonth
  holdings: DividendHolding[]
  onEdit: () => void
}

const TICKER_ORDER = DIVIDEND_TICKER_ORDER
const cellSx = dividendTableCellSx
const headCellSx = dividendTableHeadCellSx
const netKrwCellSx = dividendTableNetCellSx
const netKrwHeadSx = dividendTableNetHeadSx
const col = dividendTableCol
const incomeBg = dividendIncomeBg
const netBg = dividendNetBg

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

function resolveFinancialIncome(entry: DividendEntry): number {
  if (entry.financialIncomeKrw != null && Number.isFinite(entry.financialIncomeKrw)) {
    return entry.financialIncomeKrw
  }
  return calcDividendEntry(entry).financialIncomeKrw
}

/** 연 배당률(세후 %) = 월 세후 원화 ÷ 평가금액(원) × 12 */
function resolveEntryYieldPercent(
  entry: DividendEntry,
  domestic: boolean,
  holding: DividendHolding | undefined,
): number | null {
  if (entry.shares <= 0 || !(entry.dividendKrw > 0)) return null
  const netPerShareKrw = entry.dividendKrw / entry.shares

  if (domestic) {
    const price = holding ? resolveHoldingPriceKrw(holding, holding.livePriceKrw) : 0
    return calcAnnualDividendYieldPercent(netPerShareKrw, price)
  }

  const priceUsd = holding ? resolveHoldingPriceUsd(holding, holding.livePriceUsd) : 0
  const rate = entry.exchangeRate
  if (!(priceUsd > 0) || !(rate > 0)) return null
  return calcAnnualDividendYieldPercent(netPerShareKrw, priceUsd * rate)
}

export function DividendMonthCard({ month, holdings, onEdit }: Props) {
  const label = dayjs(`${month.yearMonth}-01`).format('YYYY년 M월')
  const { summary } = month
  const rows = useMemo(() => sortEntries(month.entries), [month.entries])

  const holdingByTicker = useMemo(() => {
    const map = new Map<string, DividendHolding>()
    for (const row of holdings) map.set(row.ticker, row)
    return map
  }, [holdings])

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
      onClick={onEdit}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        borderColor: 'divider',
        '&:hover': { borderColor: 'primary.light' },
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

      <TableContainer sx={{ overflowX: 'hidden' }}>
        <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  ...headCellSx,
                  ...col.ticker,
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.06),
                }}
              >
                종목
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  ...headCellSx,
                  ...col.shares,
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.06),
                }}
              >
                주
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  ...headCellSx,
                  ...col.perShare,
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.06),
                }}
              >
                주당
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  ...headCellSx,
                  ...col.yield,
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.06),
                }}
              >
                배당률
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  ...headCellSx,
                  ...col.rate,
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.06),
                }}
              >
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
            {rows.map((entry) => {
              const domestic = entry.exchangeRate === 1 || isDomesticDividendTicker(entry.ticker)
              const holding = holdingByTicker.get(entry.ticker)
              const grossUsd = !domestic ? entry.foreignSettlement + entry.foreignTax : null
              const yieldPercent = resolveEntryYieldPercent(entry, domestic, holding)
              return (
                <TableRow key={entry.id} hover>
                  <TableCell sx={{ ...cellSx, ...col.ticker }}>
                    <Tooltip
                      title={
                        domestic
                          ? `${entry.dayOfMonth}일`
                          : `${entry.dayOfMonth}일 · 세전 ${grossUsd != null ? formatUsd(grossUsd) : '—'}`
                      }
                    >
                      <span>{entry.ticker}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, ...col.shares }}>
                    {entry.shares}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, ...col.perShare }}>
                    {domestic
                      ? entry.shares > 0
                        ? Math.round((entry.foreignSettlement + entry.foreignTax) / entry.shares).toLocaleString(
                            'ko-KR',
                          )
                        : '—'
                      : entry.shares > 0
                        ? formatDividendUsdCell((entry.foreignSettlement + entry.foreignTax) / entry.shares)
                        : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, ...col.yield, color: 'text.secondary' }}>
                    {formatDividendYieldCell(yieldPercent)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, ...col.rate }}>
                    {domestic ? '—' : formatDividendRateCell(entry.exchangeRate)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellSx, ...col.income, bgcolor: incomeBg }}>
                    {formatDividendKrwCell(resolveFinancialIncome(entry))}
                  </TableCell>
                  <TableCell align="right" sx={{ ...netKrwCellSx, ...col.net, bgcolor: netBg }}>
                    {formatDividendKrwCell(entry.dividendKrw)}
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
