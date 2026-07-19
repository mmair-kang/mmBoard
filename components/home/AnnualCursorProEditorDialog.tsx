'use client'
// 수정: Auto — 2026-07-19 15:10 (연납 Cursor PRO 입력)

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
  DEFAULT_CURSOR_PRO_USD_KRW,
  cursorProAnnualGrandTotal,
  defaultCursorProAnnualDetail,
  formatCursorProUsd,
  formatDaysRemainingLabel,
  getCursorProNextPaymentDate,
  getCursorProNextResetDate,
  calcDaysRemaining,
  type CursorProAnnualDetail,
} from '@/lib/cursorProAnnualDetail'
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
  initial: CursorProAnnualDetail | null
  paymentTitle?: string
  onClose: () => void
  onSave: (detail: CursorProAnnualDetail) => void
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

function parseUsdInput(raw: string): number {
  const v = Number(raw.replace(/[^\d.]/g, ''))
  if (!Number.isFinite(v) || v < 0) return 0
  return Math.round(v * 100) / 100
}

function parseWonInput(raw: string): number {
  return Math.round(Number(raw.replace(/[^\d]/g, ''))) || 0
}

function parseDayInput(raw: string): number {
  const v = Math.round(Number(raw.replace(/[^\d]/g, '')))
  if (!Number.isFinite(v)) return 1
  return Math.min(31, Math.max(1, v))
}

function toIso(value: Dayjs | null): string {
  return value && value.isValid() ? value.format('YYYY-MM-DD') : ''
}

export function AnnualCursorProEditorDialog({
  open,
  initial,
  paymentTitle,
  onClose,
  onSave,
}: Props) {
  const [detail, setDetail] = useState<CursorProAnnualDetail>(() => defaultCursorProAnnualDetail())

  useEffect(() => {
    if (!open) return
    setDetail(initial ? structuredClone(initial) : defaultCursorProAnnualDetail())
  }, [open, initial])

  const total = useMemo(() => cursorProAnnualGrandTotal(detail), [detail])
  const nextReset = useMemo(() => getCursorProNextResetDate(detail.resetDay), [detail.resetDay])
  const resetDays = useMemo(() => calcDaysRemaining(nextReset), [nextReset])
  const nextPayment = useMemo(
    () => getCursorProNextPaymentDate(detail.lastPaidOn),
    [detail.lastPaidOn],
  )
  const paymentDays = useMemo(
    () => (nextPayment ? calcDaysRemaining(nextPayment) : null),
    [nextPayment],
  )

  const patch = (partial: Partial<CursorProAnnualDetail>) => {
    setDetail((prev) => {
      const next = { ...prev, ...partial }
      if (partial.annualUsd != null && partial.amountKrw == null) {
        next.amountKrw = Math.round(next.annualUsd * DEFAULT_CURSOR_PRO_USD_KRW)
      }
      return next
    })
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
          Cursor PRO 상세 입력
          {paymentTitle ? ` · ${paymentTitle}` : ''}
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Stack spacing={formDialogFieldStackSpacing}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Cursor AI 연간 요금제 정보입니다. 연납 금액은 원화로 합계에 반영됩니다.
            </Typography>

            <TextField
              label="요금제명"
              value={detail.planName}
              onChange={(e) => patch({ planName: e.target.value })}
              fullWidth
              placeholder="Pro"
              {...formDialogCompactTextFieldProps}
            />

            <TextField
              label="연간 요금 (USD)"
              value={detail.annualUsd ? String(detail.annualUsd) : ''}
              onChange={(e) => patch({ annualUsd: parseUsdInput(e.target.value) })}
              fullWidth
              inputProps={{ inputMode: 'decimal' }}
              InputProps={{ startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography> }}
              {...formDialogCompactTextFieldProps}
            />

            <TextField
              label="연납 원화"
              value={detail.amountKrw ? String(detail.amountKrw) : ''}
              onChange={(e) => patch({ amountKrw: parseWonInput(e.target.value) })}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
              InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
              helperText={`기본 환산 ${DEFAULT_CURSOR_PRO_USD_KRW}원/$ · ${formatCursorProUsd(detail.annualUsd)}`}
              {...formDialogCompactTextFieldProps}
            />

            <TextField
              label="리셋일 (매월)"
              value={String(detail.resetDay)}
              onChange={(e) => patch({ resetDay: parseDayInput(e.target.value) })}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
              InputProps={{
                startAdornment: (
                  <Typography variant="body2" sx={{ mr: 0.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    매월
                  </Typography>
                ),
                endAdornment: <Typography variant="body2">일</Typography>,
              }}
              helperText={`리셋 ${formatDaysRemainingLabel(resetDays)} (${nextReset.format('M월 D일')})`}
              {...formDialogCompactTextFieldProps}
            />

            <DatePicker
              label="마지막 결제일"
              value={detail.lastPaidOn ? dayjs(detail.lastPaidOn) : null}
              onChange={(v) => patch({ lastPaidOn: toIso(v) })}
              format="YYYY.MM.DD"
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
                  다음 결제일 (1년)
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>
                    {nextPayment.format('YYYY년 M월 D일')}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.84rem', color: 'primary.main' }}>
                    {paymentDays != null ? formatDaysRemainingLabel(paymentDays) : '-'}
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                마지막 결제일을 입력하면 다음 결제일이 표시됩니다
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
        <Button variant="contained" onClick={handleSave} disabled={total < 1 || !detail.planName.trim()}>
          반영
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
