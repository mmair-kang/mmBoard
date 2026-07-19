'use client'
// 수정: Auto — 2026-07-19 13:00 (렌탈 계약정보 입력)

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
  defaultRentalDetail,
  formatRentalPeriodRemaining,
  type RentalDetail,
} from '@/lib/rentalExpenseDetail'
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
  initial: RentalDetail | null
  expenseTitle?: string
  onClose: () => void
  onSave: (detail: RentalDetail) => void
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

export function MonthlyRentalEditorDialog({
  open,
  initial,
  expenseTitle,
  onClose,
  onSave,
}: Props) {
  const [detail, setDetail] = useState<RentalDetail>(() => defaultRentalDetail())

  useEffect(() => {
    if (!open) return
    setDetail(initial ? structuredClone(initial) : defaultRentalDetail())
  }, [open, initial])

  const remaining = useMemo(
    () => formatRentalPeriodRemaining(detail.periodEnd),
    [detail.periodEnd],
  )

  const patch = (partial: Partial<RentalDetail>) => {
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
          렌탈 계약정보 입력
          {expenseTitle ? ` · ${expenseTitle}` : ''}
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Stack spacing={formDialogFieldStackSpacing}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              약정기간·소유권 도래일·관리유형만 입력하세요. 월 렌탈료가 고정비 금액으로 반영됩니다.
            </Typography>

            <TextField
              label="렌탈요금제"
              value={detail.planName}
              onChange={(e) => patch({ planName: e.target.value })}
              fullWidth
              placeholder="렌탈요금제"
              {...formDialogCompactTextFieldProps}
            />

            <TextField
              label="월 렌탈료"
              value={detail.monthlyFee ? String(detail.monthlyFee) : ''}
              onChange={(e) => patch({ monthlyFee: parseWonInput(e.target.value) })}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
              InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
              {...formDialogCompactTextFieldProps}
            />

            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: 'primary.main' }}>
              약정기간
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <DatePicker
                label="시작"
                value={detail.periodStart ? dayjs(detail.periodStart) : null}
                onChange={(v) => patch({ periodStart: toIso(v) })}
                format="YYYY.MM.DD"
                slotProps={dateSlotProps}
              />
              <Typography sx={{ fontWeight: 700, flexShrink: 0 }}>~</Typography>
              <DatePicker
                label="종료"
                value={detail.periodEnd ? dayjs(detail.periodEnd) : null}
                onChange={(v) => patch({ periodEnd: toIso(v) })}
                format="YYYY.MM.DD"
                slotProps={dateSlotProps}
              />
            </Stack>
            {remaining ? (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color:
                    remaining === '종료됨'
                      ? 'error.main'
                      : remaining === '오늘 종료'
                        ? 'warning.main'
                        : 'primary.main',
                  mt: -0.5,
                }}
              >
                {remaining}
              </Typography>
            ) : null}

            <DatePicker
              label="소유권 도래일"
              value={detail.ownershipDate ? dayjs(detail.ownershipDate) : null}
              onChange={(v) => patch({ ownershipDate: toIso(v) })}
              format="YYYY.MM.DD"
              slotProps={dateSlotProps}
            />

            <TextField
              label="관리 유형"
              value={detail.managementType}
              onChange={(e) => patch({ managementType: e.target.value })}
              fullWidth
              placeholder="자가관리"
              {...formDialogCompactTextFieldProps}
            />

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
                <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {formatWon(detail.monthlyFee)}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ ...formDialogActionsSx, px: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave} disabled={detail.monthlyFee < 1}>
          반영
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
