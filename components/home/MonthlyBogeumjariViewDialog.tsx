'use client'
// 수정: Auto — 2026-07-19 16:15 (결제 카드 표시)
// 수정: Auto — 2026-07-19 13:15 (대출잔액 자산연동)

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
import { useAssetSettings } from '@/hooks/useAssetSettings'
import { formatWon } from '@/lib/annualPaymentCalc'
import { formatLoanRate } from '@/lib/assetPayload'
import {
  bogeumjariGrandTotal,
  getBogeumjariBreakdown,
  type BogeumjariDetail,
} from '@/lib/bogeumjariExpenseDetail'
import { formatLoanDateKo } from '@/lib/bogeumjariLoanCalc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo } from 'react'

type Props = {
  open: boolean
  title: string
  detail: BogeumjariDetail | null
  payType?: MonthlyExpensePayType
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

function InfoRow({ label, value }: { label: string; value: string }) {
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
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '0.84rem', textAlign: 'right' }}>
        {value || '-'}
      </Typography>
    </Stack>
  )
}

export function MonthlyBogeumjariViewDialog({
  open,
  title,
  detail,
  payType = 'card',
  cardTitle,
  onClose,
  onEdit,
}: Props) {
  const { bogeumjariLoan } = useAssetSettings()
  const breakdown = useMemo(
    () => (detail ? getBogeumjariBreakdown(detail, bogeumjariLoan) : null),
    [detail, bogeumjariLoan],
  )
  const fee = detail ? bogeumjariGrandTotal(detail) : 0
  const productLabel = detail?.productName?.trim() || title

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
          <Typography sx={{ fontSize: '1.02rem', fontWeight: 800 }}>보금자리론</Typography>
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'primary.light' }}>
            {productLabel}
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
            <Stack spacing={1.1}>
              <Paper
                variant="outlined"
                sx={{
                  px: 1.25,
                  py: 1.1,
                  borderRadius: 2,
                  bgcolor: (theme) =>
                    alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.06 : 0.03),
                  borderColor: (theme) => alpha(theme.palette.error.main, 0.14),
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                  상품
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>{detail.productName}</Typography>
              </Paper>

              <Box>
                <Box sx={{ borderBottom: 2, borderColor: 'text.primary', mb: 0.25 }} />
                <MonthlyExpensePayInfoRows payType={payType} cardTitle={cardTitle} labelWidth={100} />
                <InfoRow label="대출일자" value={formatLoanDateKo(detail.loanStart)} />
                <InfoRow label="대출만기" value={formatLoanDateKo(detail.loanMaturity)} />
                <InfoRow label="금리" value={`고정금리 ${formatLoanRate(detail.annualRatePercent)}`} />
                <InfoRow label="상환방식" value={detail.repaymentMethod} />
                <InfoRow label="납부일" value={`매월 ${detail.paymentDay}일`} />
                <InfoRow
                  label="대출잔액"
                  value={bogeumjariLoan ? `${bogeumjariLoan.toLocaleString('ko-KR')}원` : '-'}
                />
                <InfoRow
                  label="월 상환액"
                  value={detail.monthlyPayment ? `${detail.monthlyPayment.toLocaleString('ko-KR')}원` : '-'}
                />
              </Box>

              {breakdown ? (
                <Paper variant="outlined" sx={{ px: 1.25, py: 1, borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', mb: 0.75 }}>예상 원리금</Typography>
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        원금
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.84rem' }}>
                        {formatWon(breakdown.principalPart)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        이자
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: 'text.secondary' }}>
                        {formatWon(breakdown.interestPart)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontWeight: 600, display: 'block', mt: 0.75, lineHeight: 1.4 }}
                  >
                    월 상환액 기준, 다음 회차 원금·이자 예상입니다.
                  </Typography>
                </Paper>
              ) : null}
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
        <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>월 상환 {formatWon(fee)}</Typography>
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
