'use client'
// 수정: Auto — 2026-07-19 16:10 (납부시기·결제카드 표시)
// 수정: Auto — 2026-07-19 16:00 (연납 네이버플러스 멤버십 조회)

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
  getAnnualPaymentPayTypeLabel,
  type AnnualPaymentPayType,
} from '@/lib/annualPaymentTypes'
import {
  formatNaverPlusDateShort,
  getNaverPlusScheduleInfo,
  naverPlusAnnualGrandTotal,
  type NaverPlusAnnualDetail,
} from '@/lib/naverPlusAnnualDetail'
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
  detail: NaverPlusAnnualDetail | null
  dueLabel?: string
  payType?: AnnualPaymentPayType
  cardTitle?: string | null
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
      sx={{ py: 0.85, borderBottom: 1, borderColor: 'divider', gap: 1 }}
    >
      <Typography
        sx={{
          width: 110,
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
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {accent}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  )
}

export function AnnualNaverPlusViewDialog({
  open,
  title,
  detail,
  dueLabel,
  payType = 'card',
  cardTitle,
  onClose,
  onEdit,
}: Props) {
  const schedule = useMemo(() => (detail ? getNaverPlusScheduleInfo(detail) : null), [detail])
  const fee = detail ? naverPlusAnnualGrandTotal(detail) : 0
  const planLabel = detail?.planName?.trim() || title

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
          <Typography sx={{ fontSize: '1.02rem', fontWeight: 800 }}>네이버플러스</Typography>
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'primary.light' }}>
            {planLabel}
          </Typography>
        </Stack>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          {!detail || !schedule ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontWeight: 600 }}>
              등록된 상세 내역이 없습니다
            </Typography>
          ) : (
            <Stack spacing={1.1}>
              <Box
                sx={{
                  border: 1,
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 1.75,
                  px: 1.25,
                  py: 1.1,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                  멤버십
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>{detail.planName}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: 'primary.main' }}>
                    {formatWon(fee)}
                    <Box component="span" sx={{ fontSize: '0.72rem', fontWeight: 700, ml: 0.25, opacity: 0.8 }}>
                      /년
                    </Box>
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Box sx={{ borderBottom: 2, borderColor: 'text.primary', mb: 0.25 }} />
                {dueLabel ? <InfoRow label="납부시기" value={dueLabel} /> : null}
                <InfoRow label="결제" value={getAnnualPaymentPayTypeLabel(payType)} />
                {payType === 'card' ? (
                  <InfoRow label="결제 카드" value={cardTitle?.trim() || '-'} />
                ) : null}
                <InfoRow label="마지막 결제" value={formatNaverPlusDateShort(detail.lastPaidOn)} />
                <InfoRow
                  label="다음 결제예정"
                  value={
                    schedule.nextPayment
                      ? formatNaverPlusDateShort(schedule.nextPayment.format('YYYY-MM-DD'))
                      : '-'
                  }
                  accent={schedule.paymentLabel}
                />
                <InfoRow label="연간 결제금액" value={formatWon(fee)} />
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
        <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>{formatWon(fee)}</Typography>
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
