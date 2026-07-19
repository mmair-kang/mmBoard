'use client'
// 수정: Auto — 2026-07-19 16:00 (연납 네이버플러스 멤버십 입력)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogActionsSx,
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogPaperSlotSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  calcNaverPlusDaysRemaining,
  defaultNaverPlusAnnualDetail,
  formatNaverPlusDateShort,
  formatNaverPlusDaysRemainingLabel,
  getNaverPlusNextPaymentDate,
  naverPlusAnnualGrandTotal,
  type NaverPlusAnnualDetail,
} from '@/lib/naverPlusAnnualDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  initial: NaverPlusAnnualDetail | null
  paymentTitle?: string
  onClose: () => void
  onSave: (detail: NaverPlusAnnualDetail) => void
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

const dateSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    fullWidth: true,
  },
  field: { clearable: true },
} as const

function parseWonInput(raw: string): number {
  return Math.round(Number(raw.replace(/[^\d]/g, ''))) || 0
}

function toIso(value: Dayjs | null): string {
  return value && value.isValid() ? value.format('YYYY-MM-DD') : ''
}

export function AnnualNaverPlusEditorDialog({
  open,
  initial,
  paymentTitle,
  onClose,
  onSave,
}: Props) {
  const [detail, setDetail] = useState<NaverPlusAnnualDetail>(() => defaultNaverPlusAnnualDetail())

  useEffect(() => {
    if (!open) return
    setDetail(initial ? structuredClone(initial) : defaultNaverPlusAnnualDetail())
  }, [open, initial])

  const total = useMemo(() => naverPlusAnnualGrandTotal(detail), [detail])
  const nextPayment = useMemo(
    () => getNaverPlusNextPaymentDate(detail.lastPaidOn),
    [detail.lastPaidOn],
  )
  const paymentDays = useMemo(
    () => (nextPayment ? calcNaverPlusDaysRemaining(nextPayment) : null),
    [nextPayment],
  )

  const patch = (partial: Partial<NaverPlusAnnualDetail>) => {
    setDetail((prev) => ({ ...prev, ...partial }))
  }

  const handleSave = () => {
    onSave(detail)
    onClose()
  }

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
          네이버플러스 멤버십 상세 입력
          {paymentTitle ? ` · ${paymentTitle}` : ''}
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Stack spacing={formDialogFieldStackSpacing}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              마지막 결제일을 입력하면 다음 결제예정일(1년 후)과 남은 기간이 표시됩니다.
            </Typography>

            <TextField
              label="멤버십명"
              value={detail.planName}
              onChange={(e) => patch({ planName: e.target.value })}
              fullWidth
              placeholder="네이버플러스 멤버십"
              {...formDialogCompactTextFieldProps}
            />

            <TextField
              label="연간 결제금액"
              value={detail.amountKrw ? String(detail.amountKrw) : ''}
              onChange={(e) => patch({ amountKrw: parseWonInput(e.target.value) })}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
              InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
              {...formDialogCompactTextFieldProps}
            />

            <DatePicker
              label="마지막 결제일"
              value={detail.lastPaidOn ? dayjs(detail.lastPaidOn) : null}
              onChange={(v) => patch({ lastPaidOn: toIso(v) })}
              format="YY. M. D"
              slotProps={dateSlotProps}
            />

            {nextPayment ? (
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.75,
                  px: 1.25,
                  py: 1,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                  다음 결제예정일 (1년)
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>
                    {formatNaverPlusDateShort(nextPayment.format('YYYY-MM-DD'))}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.84rem', color: 'primary.main' }}>
                    {paymentDays != null ? formatNaverPlusDaysRemainingLabel(paymentDays) : '-'}
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                마지막 결제일을 입력하면 다음 결제예정일이 표시됩니다
              </Typography>
            )}

            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.75,
                px: 1.25,
                py: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontWeight: 800 }}>고정비 반영</Typography>
                <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>{formatWon(total)}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ ...formDialogActionsSx, px: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={total < 1 || !detail.planName.trim() || !detail.lastPaidOn}
        >
          반영
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
