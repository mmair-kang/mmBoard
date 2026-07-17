'use client'
// 수정: Auto — 2026-07-18 01:48 (주 열 너비)
// 수정: Auto — 2026-07-15 01:34 (연금 칩 제거)
// 수정: Auto — 2026-07-15 01:29 (예수금 input 너비)
// 수정: Auto — 2026-07-14 01:50 (요약 오른쪽 정렬)
// 수정: Auto — 2026-07-14 01:49 (요약 금액 붙여 표시)
// 수정: Auto — 2026-07-14 01:47 (현재가·수익금 열 너비)
// 수정: Auto — 2026-07-14 01:46 (요약 1줄·수익률 열)
// 수정: Auto — 2026-07-14 01:45 (표 하단 요약·예수금 행 제거)
// 수정: Auto — 2026-07-14 01:42 (예수금 input 크기)

import { FreshAmountField } from '@/components/common/FreshAmountField'
import type { InvestmentAccountView } from '@/hooks/useInvestments'
import { formatWon } from '@/lib/accountCalc'
import { formatReturnRate, returnTone } from '@/lib/investmentCalc'
import { formatRelativeDayKo } from '@/lib/relativeDayLabel'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'
import { useMemo } from 'react'

type Props = {
  account: InvestmentAccountView
  cashSaving?: boolean
  onOpenEdit: () => void
  onCashCommit: (amount: number) => Promise<void>
}

const cellBase = {
  px: { xs: 0.4, md: 0.45 },
  py: { xs: 0.35, md: 0.4 },
  fontSize: '0.68rem',
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  borderColor: 'divider',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const

const cellSx = {
  ...cellBase,
  fontWeight: { xs: 700, md: 500 },
} as const

const headCellSx = {
  ...cellBase,
  fontWeight: { xs: 800, md: 700 },
  color: 'text.secondary',
} as const

const nameCellSx = {
  ...cellSx,
  fontWeight: { xs: 900, md: 600 },
  px: { xs: 0.35, md: 0.45 },
} as const

const currentPriceCellSx = {
  ...cellSx,
  fontWeight: { xs: 800, md: 700 },
} as const

const returnCellSx = {
  ...cellSx,
  fontWeight: { xs: 800, md: 700 },
} as const

const ACCOUNT_THEME: Record<
  InvestmentAccountView['id'],
  { color: 'primary' | 'secondary' | 'warning' | 'info'; label: string }
> = {
  nh: { color: 'primary', label: 'NH' },
  ds: { color: 'secondary', label: 'DS' },
  psf: { color: 'warning', label: 'PSF' },
  irp: { color: 'info', label: 'IRP' },
}

function sectionBg(theme: Theme, color: 'primary' | 'secondary' | 'warning' | 'info') {
  return alpha(theme.palette[color].main, 0.06)
}

function sectionHeadBg(theme: Theme, color: 'primary' | 'secondary' | 'warning' | 'info') {
  return alpha(theme.palette[color].main, 0.12)
}

function toneColor(tone: ReturnType<typeof returnTone>) {
  if (tone === 'up') return 'error.main'
  if (tone === 'down') return 'info.main'
  return 'text.secondary'
}

function formatKrwCell(value: number | null) {
  if (value == null) return '—'
  return value.toLocaleString('ko-KR')
}

export function InvestmentAccountCard({ account, cashSaving, onOpenEdit, onCashCommit }: Props) {
  const themeMeta = ACCOUNT_THEME[account.id]
  const summaryTone = returnTone(account.summary.returnRate)
  const cashUpdatedLabel = useMemo(
    () => formatRelativeDayKo(account.cashBalanceUpdatedAt),
    [account.cashBalanceUpdatedAt],
  )

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        minWidth: 0,
        overflow: 'hidden',
        borderColor: `${themeMeta.color}.light`,
        borderWidth: 1.5,
        bgcolor: (theme) => sectionBg(theme, themeMeta.color),
        transition: 'box-shadow 0.15s ease',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          px: 0.85,
          py: 0.45,
          minHeight: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) => sectionHeadBg(theme, themeMeta.color),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.4} sx={{ flex: 1, minWidth: 0, flexWrap: 'wrap', rowGap: 0.15 }}>
          <Chip
            size="small"
            label={account.label}
            color={themeMeta.color}
            sx={{
              height: { xs: 18, md: 20 },
              fontWeight: 700,
              fontSize: { xs: '0.62rem', md: '0.64rem' },
              '& .MuiChip-label': { px: 0.6 },
            }}
          />
          <Typography
            sx={{
              fontWeight: { xs: 900, md: 700 },
              fontSize: { xs: '0.84rem', md: '0.78rem' },
              lineHeight: 1.2,
              color: 'text.primary',
            }}
          >
            {account.title}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.45}
          sx={{ flexShrink: 0, minWidth: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.66rem', md: '0.64rem' },
              color: 'text.secondary',
              whiteSpace: 'nowrap',
            }}
          >
            {account.cashLabel}
          </Typography>
          <Box sx={{ width: { xs: 118, sm: 132 }, flexShrink: 0, '& .MuiFormControl-root': { width: '100%' } }}>
            <FreshAmountField
              value={account.cashBalanceKrw}
              onCommit={onCashCommit}
              disabled={cashSaving}
              dense
              fullWidth={false}
              softInput="primary"
              leadingLabel={cashUpdatedLabel}
            />
          </Box>
        </Stack>
      </Stack>

      <Box
        onClick={onOpenEdit}
        sx={{
          cursor: 'pointer',
          '&:hover .investment-table-body': {
            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
          },
        }}
      >
        <TableContainer
          className="investment-table-body"
          sx={{ width: '100%', overflow: 'hidden' }}
        >
          <Table
            size="small"
            sx={{
              width: '100%',
              tableLayout: 'fixed',
              '& .MuiTableCell-root': { borderColor: 'divider' },
            }}
          >
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': headCellSx }}>
                <TableCell sx={{ width: '19%' }}>종목</TableCell>
                <TableCell align="right" sx={{ width: '11%' }}>
                  주
                </TableCell>
                <TableCell align="right" sx={{ width: '15%' }}>
                  매수가
                </TableCell>
                <TableCell align="right" sx={{ width: '18%' }}>
                  현재가
                </TableCell>
                <TableCell align="right" sx={{ width: '16%', minWidth: 42 }}>
                  수익률
                </TableCell>
                <TableCell align="right" sx={{ width: '20%' }}>
                  수익금
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {account.holdings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ ...cellSx, color: 'text.secondary', textAlign: 'center', py: 1.5 }}>
                    등록된 종목이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                account.holdings.map((row) => {
                  const tone = returnTone(row.returnRate)
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ ...nameCellSx, color: `${themeMeta.color}.dark` }}>
                        <Typography
                          noWrap
                          sx={{ fontSize: 'inherit', fontWeight: 'inherit', maxWidth: '100%', color: 'inherit' }}
                          title={row.name}
                        >
                          {row.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {row.shares}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellSx, color: 'text.secondary' }}>
                        {formatKrwCell(row.purchasePrice)}
                      </TableCell>
                      <TableCell align="right" sx={{ ...currentPriceCellSx, color: `${themeMeta.color}.dark` }}>
                        {formatKrwCell(row.livePriceKrw)}
                      </TableCell>
                      <TableCell align="right" sx={{ ...returnCellSx, color: toneColor(tone) }}>
                        {formatReturnRate(row.returnRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ ...returnCellSx, color: toneColor(tone) }}>
                        {row.profitLossKrw != null ? formatKrwCell(row.profitLossKrw) : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          columnGap={1}
          rowGap={0.35}
          divider={
            <Box
              sx={{
                width: '1px',
                height: 14,
                bgcolor: 'divider',
                flexShrink: 0,
              }}
            />
          }
          sx={{
            width: '100%',
            px: 1,
            py: 0.55,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette[themeMeta.color].main, 0.05),
          }}
        >
          <Stack direction="row" alignItems="baseline" spacing={0.65} sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              평가금액
            </Typography>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '0.78rem', md: '0.76rem' },
                color: `${themeMeta.color}.dark`,
                whiteSpace: 'nowrap',
              }}
            >
              {formatWon(account.summary.totalCurrentKrw)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="baseline" spacing={0.65} sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              총수익금
            </Typography>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '0.78rem', md: '0.76rem' },
                color: toneColor(summaryTone),
                whiteSpace: 'nowrap',
              }}
            >
              {formatWon(account.summary.profitLossKrw)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  )
}
