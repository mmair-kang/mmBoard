'use client'
// 수정: Auto — 2026-06-15 (PC 타이포·굵기 균형)

import type { InvestmentAccountView } from '@/hooks/useInvestments'
import { formatReturnRate, returnTone } from '@/lib/investmentCalc'
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
  onOpenDetail: () => void
  onEdit?: () => void
}

const cellSx = {
  px: { xs: 0.35, md: 0.45 },
  py: { xs: 0.35, md: 0.4 },
  fontSize: { xs: '0.62rem', sm: '0.66rem', md: '0.68rem' },
  fontWeight: 500,
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  borderColor: 'divider',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const

const headCellSx = {
  ...cellSx,
  fontWeight: 700,
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

function toneColor(tone: ReturnType<typeof returnTone>) {
  if (tone === 'up') return 'error.main'
  if (tone === 'down') return 'info.main'
  return 'text.secondary'
}

const EMPTY_MARK = '-'

function formatKrwCell(value: number | null) {
  if (value == null) return '—'
  return value.toLocaleString('ko-KR')
}

export function InvestmentAccountCard({ account, onOpenDetail, onEdit }: Props) {
  const themeMeta = ACCOUNT_THEME[account.id]
  const summaryTone = returnTone(account.summary.returnRate)

  return (
    <Paper
      variant="outlined"
      onClick={onOpenDetail}
      sx={{
        borderRadius: 2,
        minWidth: 0,
        overflow: 'hidden',
        borderColor: `${themeMeta.color}.light`,
        borderWidth: 1.5,
        bgcolor: (theme) => sectionBg(theme, themeMeta.color),
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease',
        '&:hover': {
          boxShadow: (theme) => `0 0 0 1px ${alpha(theme.palette[themeMeta.color].main, 0.2)}`,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          px: 0.85,
          py: 0.4,
          minHeight: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) => sectionHeadBg(theme, themeMeta.color),
        }}
      >
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ flexWrap: 'wrap', rowGap: 0.15 }}>
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
                fontWeight: 600,
                fontSize: { xs: '0.8rem', md: '0.75rem' },
                lineHeight: 1.2,
                color: 'text.primary',
              }}
            >
              {account.title}
            </Typography>
            {account.pensionNote ? (
              <Chip
                size="small"
                variant="outlined"
                label={account.pensionNote}
                sx={{ height: 17, fontWeight: 700, fontSize: '0.55rem', '& .MuiChip-label': { px: 0.5 } }}
              />
            ) : null}
          </Stack>
        </Stack>
        {onEdit ? (
          <Tooltip title="수정">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              aria-label="계좌 수정"
              sx={{ flexShrink: 0, width: 24, height: 24, p: 0.25 }}
            >
              <EditRoundedIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>

      <TableContainer sx={{ width: '100%', overflow: 'hidden' }}>
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
              <TableCell sx={{ width: '15%' }}>종목</TableCell>
              <TableCell align="right" sx={{ width: '10%' }}>
                주
              </TableCell>
              <TableCell align="right" sx={{ width: '16%' }}>
                매수가
              </TableCell>
              <TableCell align="right" sx={{ width: '21%' }}>
                현재가
              </TableCell>
              <TableCell align="right" sx={{ width: '15%' }}>
                수익률
              </TableCell>
              <TableCell align="right" sx={{ width: '23%' }}>
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
                    <TableCell
                      sx={{ ...cellSx, color: `${themeMeta.color}.dark`, fontWeight: 600, px: { xs: 0.25, md: 0.35 } }}
                    >
                      <Typography
                        noWrap
                        sx={{ fontSize: 'inherit', fontWeight: 'inherit', maxWidth: '100%', color: 'inherit' }}
                        title={row.name}
                      >
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, fontWeight: 500 }}>
                      {row.shares}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: 'text.secondary', fontWeight: 500 }}>
                      {formatKrwCell(row.purchasePrice)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: `${themeMeta.color}.dark`, fontWeight: 600 }}>
                      {formatKrwCell(row.livePriceKrw)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: toneColor(tone), fontWeight: 700 }}>
                      {formatReturnRate(row.returnRate)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, color: toneColor(tone), fontWeight: 700 }}>
                      {row.profitLossKrw != null ? formatKrwCell(row.profitLossKrw) : '—'}
                    </TableCell>
                  </TableRow>
                )
              })
            )}

            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
              <TableCell sx={{ ...cellSx, color: `${themeMeta.color}.dark`, fontWeight: 600 }}>예수금</TableCell>
              <TableCell align="right" sx={cellSx}>
                {EMPTY_MARK}
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                {EMPTY_MARK}
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 600 }}>
                {formatKrwCell(account.cashBalanceKrw)}
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                {EMPTY_MARK}
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                {EMPTY_MARK}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ ...cellSx, color: `${themeMeta.color}.dark`, fontWeight: 600 }}>합산</TableCell>
              <TableCell align="right" sx={cellSx}>
                {EMPTY_MARK}
              </TableCell>
              <TableCell align="right" sx={cellSx}>
                {EMPTY_MARK}
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 700 }}>
                {formatKrwCell(account.summary.totalCurrentKrw)}
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 700, color: toneColor(summaryTone) }}>
                {account.summary.returnRate != null ? formatReturnRate(account.summary.returnRate) : EMPTY_MARK}
              </TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 700, color: toneColor(summaryTone) }}>
                {formatKrwCell(account.summary.profitLossKrw)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
