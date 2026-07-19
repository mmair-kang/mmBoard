'use client'
// 수정: Auto — 2026-07-19 13:00 (렌탈 계약정보 조회)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogActionsSx,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogPaperSlotSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  formatRentalDate,
  formatRentalPeriod,
  formatRentalPeriodRemaining,
  type RentalDetail,
} from '@/lib/rentalExpenseDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

type Props = {
  open: boolean
  title: string
  detail: RentalDetail | null
  onClose: () => void
  onEdit: () => void
}

const wideSlotProps = {
  paper: {
    sx: {
      ...formDialogPaperSlotSx,
      maxWidth: 480,
      width: { xs: 'calc(100% - 20px)', sm: 'calc(100% - 32px)' },
      mx: { xs: 1.25, sm: 2 },
    },
  },
} as const

function InfoRow({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string | null
}) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      sx={{
        py: 0.85,
        borderBottom: 1,
        borderColor: 'divider',
        gap: 1,
      }}
    >
      <Typography
        sx={{
          width: 100,
          flexShrink: 0,
          fontWeight: 700,
          fontSize: '0.8rem',
          color: 'text.secondary',
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.84rem' }}>{value || '-'}</Typography>
        {accent ? (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color:
                accent === '종료됨'
                  ? 'error.main'
                  : accent === '오늘 종료'
                    ? 'warning.main'
                    : 'primary.main',
            }}
          >
            {accent}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  )
}

export function MonthlyRentalViewDialog({ open, title, detail, onClose, onEdit }: Props) {
  const remaining = useMemo(
    () => (detail ? formatRentalPeriodRemaining(detail.periodEnd) : null),
    [detail],
  )
  const planLabel = detail?.planName?.trim() || title
  const fee = detail?.monthlyFee ?? 0

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ ...formDialogSlotProps, ...wideSlotProps }}
    >
      <FormDialogHeader onClose={onClose}>
        <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ minWidth: 0, pr: 1 }}>
          <Typography sx={{ fontSize: '1.02rem', fontWeight: 800 }}>계약정보</Typography>
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'primary.light' }}>
            {planLabel}
          </Typography>
        </Stack>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          {!detail ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontWeight: 600 }}>
              등록된 상세 내역이 없습니다
            </Typography>
          ) : (
            <Box>
              <Box sx={{ borderBottom: 2, borderColor: 'text.primary', mb: 0.25 }} />
              <InfoRow label="약정기간" value={formatRentalPeriod(detail)} accent={remaining} />
              <InfoRow label="소유권 도래일" value={formatRentalDate(detail.ownershipDate)} />
              <InfoRow label="관리 유형" value={detail.managementType || '-'} />
              <InfoRow
                label="월 렌탈료"
                value={detail.monthlyFee ? `${detail.monthlyFee.toLocaleString('ko-KR')}원` : '-'}
              />
            </Box>
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
        <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>렌탈료 {formatWon(fee)}</Typography>
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
