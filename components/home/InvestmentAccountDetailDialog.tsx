'use client'
// 수정: Auto — 2026-06-11

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { formDialogContentScrollSx, formDialogContentSx, formDialogPaperSlotSx } from '@/config/formDialogLayout'
import type { InvestmentAccountView } from '@/hooks/useInvestments'
import { formatReturnRate, returnTone } from '@/lib/investmentCalc'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DialogContent from '@mui/material/DialogContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type Props = {
  open: boolean
  account: InvestmentAccountView | null
  onClose: () => void
}

const cellSx = {
  px: 0.5,
  py: 0.4,
  fontSize: '0.68rem',
  fontWeight: 700,
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  borderColor: 'divider',
} as const

const headCellSx = {
  ...cellSx,
  fontWeight: 800,
  color: 'text.secondary',
} as const

function toneColor(tone: ReturnType<typeof returnTone>) {
  if (tone === 'up') return 'error.main'
  if (tone === 'down') return 'info.main'
  return 'text.secondary'
}

function formatKrwCell(value: number | null) {
  if (value == null) return '—'
  return value.toLocaleString('ko-KR')
}

export function InvestmentAccountDetailDialog({ open, account, onClose }: Props) {
  if (!account) return null

  const summaryTone = returnTone(account.summary.returnRate)

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            ...formDialogPaperSlotSx,
            mx: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' },
          },
        },
      }}
    >
      <FormDialogHeader onClose={onClose}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip size="small" label={account.label} sx={{ height: 22, fontWeight: 900, fontSize: '0.68rem' }} />
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>{account.title}</Typography>
        </Box>
      </FormDialogHeader>
      <DialogContent sx={formDialogContentSx}>
        <Box sx={formDialogContentScrollSx}>
          <Table size="small" sx={{ width: '100%', '& .MuiTableCell-root': { borderColor: 'divider' } }}>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': headCellSx }}>
                <TableCell>종목</TableCell>
                <TableCell align="right">주</TableCell>
                <TableCell align="right">매수가</TableCell>
                <TableCell align="right">현재가</TableCell>
                <TableCell align="right">수익률</TableCell>
                <TableCell align="right">수익금</TableCell>
                <TableCell align="right">매수금액</TableCell>
                <TableCell align="right">현재금액</TableCell>
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
                    <TableRow key={row.id}>
                      <TableCell sx={{ ...cellSx, fontWeight: 900 }}>
                        <Typography noWrap sx={{ fontSize: 'inherit', fontWeight: 'inherit', maxWidth: 100 }}>
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
                      <TableCell align="right" sx={cellSx}>
                        {formatKrwCell(row.purchasePrice)}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellSx, fontWeight: 800 }}>
                        {formatKrwCell(row.livePriceKrw)}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellSx, color: toneColor(tone), fontWeight: 900 }}>
                        {formatReturnRate(row.returnRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellSx, color: toneColor(tone), fontWeight: 900 }}>
                        {formatKrwCell(row.profitLossKrw)}
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

              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
                <TableCell sx={{ ...cellSx, fontWeight: 800 }}>예수금</TableCell>
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
                <TableCell align="right" sx={{ ...cellSx, fontWeight: 800 }}>
                  {formatKrwCell(account.cashBalanceKrw)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, fontWeight: 800 }}>
                  {formatKrwCell(account.cashBalanceKrw)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ ...cellSx, fontWeight: 900 }}>합산</TableCell>
                <TableCell align="right" sx={cellSx}>
                  —
                </TableCell>
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
                  {formatKrwCell(account.summary.totalPurchaseKrw)}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, fontWeight: 900 }}>
                  {formatKrwCell(account.summary.totalCurrentKrw)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
    </AppDialog>
  )
}
