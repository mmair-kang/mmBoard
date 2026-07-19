'use client'
// 수정: Auto — 2026-07-19 16:15 (결제 카드 표시)
// 수정: Auto — 2026-07-19 03:30 (국민연금 결정내역 조회)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { MonthlyExpensePayInfoRows } from '@/components/home/MonthlyExpensePayInfoRows'
import {
  formDialogActionsSx,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogPaperSlotSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { MonthlyExpensePayType } from '@/hooks/useMonthlyExpenses'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  buildNationalPensionBillRows,
  computeNationalPension,
  type NationalPensionDetail,
} from '@/lib/nationalPensionDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo } from 'react'

type Props = {
  open: boolean
  title: string
  detail: NationalPensionDetail | null
  payType?: MonthlyExpensePayType
  cardTitle?: string | null
  onClose: () => void
  onEdit: () => void
}

const wideSlotProps = {
  paper: {
    sx: {
      ...formDialogPaperSlotSx,
      maxWidth: 520,
      width: { xs: 'calc(100% - 20px)', sm: 'calc(100% - 32px)' },
      mx: { xs: 1.25, sm: 2 },
    },
  },
} as const

export function MonthlyNationalPensionViewDialog({
  open,
  title,
  detail,
  payType = 'card',
  cardTitle,
  onClose,
  onEdit,
}: Props) {
  const rows = useMemo(() => (detail ? buildNationalPensionBillRows(detail) : []), [detail])
  const total = detail ? computeNationalPension(detail).finalAmount : 0

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ ...formDialogSlotProps, ...wideSlotProps }}
    >
      <FormDialogHeader onClose={onClose}>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
          {title} · 보험료 결정내역
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.25, sm: 1.75 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          {!detail ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontWeight: 600 }}>
              등록된 상세 내역이 없습니다
            </Typography>
          ) : (
            <Stack spacing={1.1}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 0.25 }}>
                <MonthlyExpensePayInfoRows payType={payType} cardTitle={cardTitle} />
              </Box>
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                sx={{
                  px: 1.1,
                  py: 0.65,
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.72rem' }}>
                  보험료결정 세부내역
                </Typography>
                <Typography
                  sx={{ width: 110, flexShrink: 0, fontWeight: 800, fontSize: '0.72rem', textAlign: 'right' }}
                >
                  금액
                </Typography>
              </Stack>

              {rows.map((row) => {
                const isFinal = row.emphasize === 'final'
                return (
                  <Stack
                    key={row.label}
                    direction="row"
                    alignItems="center"
                    gap={1}
                    sx={{
                      px: 1.1,
                      py: 0.8,
                      borderTop: 1,
                      borderColor: 'divider',
                      bgcolor: (theme) =>
                        isFinal ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    }}
                  >
                    <Typography
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontWeight: isFinal ? 800 : 600,
                        fontSize: '0.8rem',
                      }}
                    >
                      {row.label}
                    </Typography>
                    <Typography
                      sx={{
                        width: 110,
                        flexShrink: 0,
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.valueLabel}
                    </Typography>
                  </Stack>
                )
              })}
            </Box>
            </Stack>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          ...formDialogActionsSx,
          px: { xs: 1.5, sm: 2 },
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>
          결정금액(A) {formatWon(total)}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} size="small">
            닫기
          </Button>
          <Button variant="contained" onClick={onEdit} size="small">
            수정
          </Button>
        </Stack>
      </DialogActions>
    </AppDialog>
  )
}
