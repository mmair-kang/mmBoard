'use client'
// 수정: Auto — 2026-07-19 13:15 (납부일 매월 한줄·대출잔액 자산연동)

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
import { useAssetSettings } from '@/hooks/useAssetSettings'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  bogeumjariGrandTotal,
  defaultBogeumjariDetail,
  getBogeumjariBreakdown,
  type BogeumjariDetail,
} from '@/lib/bogeumjariExpenseDetail'
import { formatLoanDateKo } from '@/lib/bogeumjariLoanCalc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  initial: BogeumjariDetail | null
  expenseTitle?: string
  onClose: () => void
  onSave: (detail: BogeumjariDetail) => void
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

function parseWonInput(raw: string): number {
  return Math.round(Number(raw.replace(/[^\d]/g, ''))) || 0
}

function parseRateInput(raw: string): number {
  const normalized = raw.replace(/,/g, '').trim().replace(/%$/, '')
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return 0
  return Math.round(Math.min(100, Math.max(0, parsed)) * 100) / 100
}

function parseDayInput(raw: string): number {
  const parsed = Math.round(Number(raw.replace(/[^\d]/g, '')))
  if (!Number.isFinite(parsed)) return 1
  return Math.min(31, Math.max(1, parsed))
}

export function MonthlyBogeumjariEditorDialog({
  open,
  initial,
  expenseTitle,
  onClose,
  onSave,
}: Props) {
  const { bogeumjariLoan } = useAssetSettings()
  const [detail, setDetail] = useState<BogeumjariDetail>(() => defaultBogeumjariDetail())

  useEffect(() => {
    if (!open) return
    setDetail(initial ? structuredClone(initial) : defaultBogeumjariDetail())
  }, [open, initial])

  const breakdown = useMemo(
    () => getBogeumjariBreakdown(detail, bogeumjariLoan),
    [detail, bogeumjariLoan],
  )
  const total = bogeumjariGrandTotal(detail)

  const patch = (partial: Partial<BogeumjariDetail>) => {
    setDetail((prev) => ({ ...prev, ...partial }))
  }

  const handleSave = () => {
    onSave({ ...detail, loanBalance: bogeumjariLoan })
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
          보금자리론 상세 입력
          {expenseTitle ? ` · ${expenseTitle}` : ''}
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Stack spacing={formDialogFieldStackSpacing}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              월 상환액이 고정비 금액으로 반영되고, 납부일은 고정비 일정으로 맞춰집니다.
            </Typography>

            <Box
              sx={{
                border: 1,
                borderColor: (theme) => alpha(theme.palette.error.main, 0.14),
                borderRadius: 1.75,
                px: 1.25,
                py: 1,
                bgcolor: (theme) =>
                  alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.06 : 0.03),
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                상품
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>{detail.productName}</Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}
              >
                {formatLoanDateKo(detail.loanStart)} ~ {formatLoanDateKo(detail.loanMaturity)} ·{' '}
                {detail.repaymentMethod}
              </Typography>
            </Box>

            <TextField
              label="연 금리"
              value={detail.annualRatePercent ? String(detail.annualRatePercent) : ''}
              onChange={(e) => patch({ annualRatePercent: parseRateInput(e.target.value) })}
              fullWidth
              inputProps={{ inputMode: 'decimal' }}
              InputProps={{ endAdornment: <Typography variant="body2">%</Typography> }}
              {...formDialogCompactTextFieldProps}
            />

            <TextField
              label="납부일"
              value={String(detail.paymentDay)}
              onChange={(e) => patch({ paymentDay: parseDayInput(e.target.value) })}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
              InputProps={{
                startAdornment: (
                  <Typography
                    variant="body2"
                    sx={{
                      mr: 0.75,
                      color: 'text.secondary',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '2.5em',
                    }}
                  >
                    매월
                  </Typography>
                ),
                endAdornment: (
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                    일
                  </Typography>
                ),
              }}
              {...formDialogCompactTextFieldProps}
            />

            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.75,
                px: 1.25,
                py: 1,
                bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.84rem' }}>대출잔액</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    자산 페이지 · 보금자리론
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>
                  {formatWon(bogeumjariLoan)}
                </Typography>
              </Stack>
            </Box>

            <TextField
              label="월 상환액"
              value={detail.monthlyPayment ? String(detail.monthlyPayment) : ''}
              onChange={(e) => patch({ monthlyPayment: parseWonInput(e.target.value) })}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
              InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
              {...formDialogCompactTextFieldProps}
            />

            {breakdown ? (
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.75,
                  px: 1.25,
                  py: 1,
                }}
              >
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
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                자산 페이지에 대출잔액을 입력하면 원금·이자를 계산합니다.
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
        <Button variant="contained" onClick={handleSave} disabled={detail.monthlyPayment < 1}>
          반영
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
