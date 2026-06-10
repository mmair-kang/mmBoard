'use client'
// 수정: Auto — 2026-06-08 (표 열 순서·반응형)

import type { InvestmentAccountView } from '@/hooks/useInvestments'
import { formatReturnRate, returnTone } from '@/lib/investmentCalc'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
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

type Props = {
  account: InvestmentAccountView
  onAdd: () => void
  onEditHolding: (holdingId: number) => void
  onEditCash: () => void
}

const cellSx = {
  px: 0.35,
  py: 0.35,
  fontSize: { xs: '0.62rem', sm: '0.66rem' },
  fontWeight: 700,
  lineHeight: 1.25,
  whiteSpace: 'nowrap',
  borderColor: 'divider',
} as const

const headCellSx = {
  ...cellSx,
  fontWeight: 800,
  color: 'text.secondary',
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

function stickyBg(theme: Theme) {
  return theme.palette.background.paper
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

function stickyCellSx(theme: Theme, color: 'primary' | 'secondary' | 'warning' | 'info') {
  return {
    ...cellSx,
    position: 'sticky' as const,
    left: 0,
    zIndex: 2,
    bgcolor: stickyBg(theme),
    boxShadow: '2px 0 4px rgba(15, 23, 42, 0.06)',
    minWidth: { xs: 72, sm: 88 },
    maxWidth: { xs: 96, sm: 120 },
  }
}

export function InvestmentAccountCard({ account, onAdd, onEditHolding, onEditCash }: Props) {
  const themeMeta = ACCOUNT_THEME[account.id]
  const summaryTone = returnTone(account.summary.returnRate)

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
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={0.5}
        sx={{
          px: 1,
          py: 0.75,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) => sectionHeadBg(theme, themeMeta.color),
        }}
      >
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.25 }}>
            <Chip
              size="small"
              label={account.label}
              color={themeMeta.color}
              sx={{ height: 22, fontWeight: 900, fontSize: '0.68rem' }}
            />
            <Typography sx={{ fontWeight: 900, fontSize: '0.88rem' }}>{account.title}</Typography>
            {account.pensionNote ? (
              <Chip
                size="small"
                variant="outlined"
                label={account.pensionNote}
                sx={{ height: 20, fontWeight: 700, fontSize: '0.6rem' }}
              />
            ) : null}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mt: 0.15 }}>
            {account.subtitle}
            {account.summary.returnRate != null ? (
              <>
                {' · '}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ fontWeight: 800, color: toneColor(summaryTone) }}
                >
                  {formatReturnRate(account.summary.returnRate)}
                </Typography>
              </>
            ) : null}
          </Typography>
        </Stack>
        <Tooltip title="종목 추가">
          <IconButton size="small" onClick={onAdd} aria-label="종목 추가" sx={{ flexShrink: 0 }}>
            <AddRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        <Table
          size="small"
          sx={{
            width: 'max(100%, 420px)',
            tableLayout: 'auto',
            '& .MuiTableCell-root': { borderColor: 'divider' },
          }}
        >
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': headCellSx }}>
              <TableCell
                sx={(theme) => ({
                  ...stickyCellSx(theme, themeMeta.color),
                  fontWeight: 800,
                  color: 'text.secondary',
                })}
              >
                종목
              </TableCell>
              <TableCell align="right">주</TableCell>
              <TableCell align="right">현재가</TableCell>
              <TableCell align="right">수익률</TableCell>
              <TableCell align="right">수익금</TableCell>
              <TableCell align="right" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                매수가
              </TableCell>
              <TableCell align="right" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                매수금액
              </TableCell>
              <TableCell align="right" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                현재금액
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {account.holdings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ ...cellSx, color: 'text.secondary', textAlign: 'center', py: 1.5 }}>
                  등록된 종목이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              account.holdings.map((row) => {
                const tone = returnTone(row.returnRate)
                return (
                  <TableRow key={row.id} hover onClick={() => onEditHolding(row.id)} sx={{ cursor: 'pointer' }}>
                    <TableCell sx={(theme) => ({ ...stickyCellSx(theme, themeMeta.color), fontWeight: 900 })}>
                      <Typography
                        noWrap
                        sx={{ fontSize: 'inherit', fontWeight: 'inherit', maxWidth: { xs: 72, sm: 110 } }}
                      >
                        {row.name}
                      </Typography>
                      <Typography
                        noWrap
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', fontWeight: 600, fontSize: '0.55rem' }}
                      >
                        {row.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={cellSx}>
                      {row.shares}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: `${themeMeta.color}.dark`, fontWeight: 800 }}>
                      {formatKrwCell(row.livePriceKrw)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: toneColor(tone), fontWeight: 900 }}>
                      {formatReturnRate(row.returnRate)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: toneColor(tone), fontWeight: 900 }}>
                      {row.profitLossKrw != null ? formatKrwCell(row.profitLossKrw) : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: 'text.secondary' }}>
                      {formatKrwCell(row.purchasePrice)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: 'text.secondary' }}>
                      {formatKrwCell(row.purchaseAmountKrw)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: 'text.secondary' }}>
                      {formatKrwCell(row.currentAmountKrw)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}

            <TableRow
              onClick={onEditCash}
              sx={{ cursor: 'pointer', bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}
            >
              <TableCell sx={(theme) => ({ ...stickyCellSx(theme, themeMeta.color), fontWeight: 800 })}>
                <Stack direction="row" alignItems="center" spacing={0.35}>
                  <span>예수금</span>
                  <EditRoundedIcon sx={{ fontSize: '0.85rem', color: 'text.secondary' }} />
                </Stack>
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                —
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                —
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                —
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                —
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                —
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                {formatKrwCell(account.cashBalanceKrw)}
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                {formatKrwCell(account.cashBalanceKrw)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={(theme) => ({ ...stickyCellSx(theme, themeMeta.color), fontWeight: 900 })}>합산</TableCell>
              <TableCell align="right" sx={cellSx}>
                —
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                —
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 900, color: toneColor(summaryTone) }}>
                {formatReturnRate(account.summary.returnRate)}
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 900, color: toneColor(summaryTone) }}>
                {formatKrwCell(account.summary.profitLossKrw)}
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 900 }}>
                —
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 900 }}>
                {formatKrwCell(account.summary.totalPurchaseKrw)}
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 900 }}>
                {formatKrwCell(account.summary.totalCurrentKrw)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
