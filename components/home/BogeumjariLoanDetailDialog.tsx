'use client'
// 수정: Auto — 2026-07-14 01:27
// 수정: Auto — 2026-07-14 01:26
// 수정: Auto — 2026-07-14 01:23

import { AppDialog } from '@/components/common/AppDialog'
import { FreshAmountField } from '@/components/common/FreshAmountField'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { formDialogContentSx, formDialogPaperSlotSx } from '@/config/formDialogLayout'
import { formatWon } from '@/lib/accountCalc'
import { formatLoanRate } from '@/lib/assetPayload'
import {
  BOGEUMJARI_LOAN_MATURITY,
  BOGEUMJARI_LOAN_PRODUCT,
  BOGEUMJARI_LOAN_REPAYMENT,
  BOGEUMJARI_LOAN_START,
  calcBogeumjariLoanPaymentBreakdown,
  formatLoanDateKo,
} from '@/lib/bogeumjariLoanCalc'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'

type Props = {
  open: boolean
  balance: number
  annualRatePercent: number
  paymentDay: number
  monthlyPayment: number
  saving?: boolean
  onRateCommit: (rate: number) => Promise<void>
  onPaymentDayCommit: (day: number) => Promise<void>
  onMonthlyPaymentCommit: (amount: number) => Promise<void>
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, flexShrink: 0 }}>
        {label}
      </Typography>
      {typeof value === 'string' ? (
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.82rem',
            textAlign: 'right',
            lineHeight: 1.35,
            wordBreak: 'keep-all',
          }}
        >
          {value}
        </Typography>
      ) : (
        <Box sx={{ textAlign: 'right' }}>{value}</Box>
      )}
    </Stack>
  )
}

function ClickableInlineNumber({
  value,
  display,
  disabled,
  inputWidth,
  onCommit,
  parse,
}: {
  value: number
  display: string
  disabled?: boolean
  inputWidth?: number
  onCommit: (next: number) => Promise<void>
  parse: (raw: string) => number | null
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [committing, setCommitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft('')
  }, [value, editing])

  const openEdit = () => {
    if (disabled || committing) return
    setEditing(true)
    setDraft(String(value))
    requestAnimationFrame(() => inputRef.current?.select())
  }

  const finishEdit = async () => {
    if (!editing) return
    setEditing(false)

    const next = parse(draft)
    if (next === null || next === value) {
      setDraft('')
      return
    }

    setCommitting(true)
    try {
      await onCommit(next)
    } finally {
      setCommitting(false)
      setDraft('')
    }
  }

  if (editing) {
    return (
      <TextField
        size="small"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d.,]/g, ''))}
        onBlur={() => void finishEdit()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            inputRef.current?.blur()
          }
          if (e.key === 'Escape') {
            setDraft('')
            setEditing(false)
            inputRef.current?.blur()
          }
        }}
        disabled={disabled || committing}
        inputRef={inputRef}
        inputProps={{
          inputMode: 'decimal',
          style: {
            textAlign: 'right',
            width: inputWidth ?? 52,
            padding: '2px 4px',
            fontSize: '0.82rem',
            fontWeight: 800,
          },
        }}
        sx={{
          width: (inputWidth ?? 52) + 20,
          '& .MuiInputBase-root': { minHeight: 26, pr: 0.5 },
          '& .MuiOutlinedInput-input': { py: 0.2 },
        }}
      />
    )
  }

  return (
    <Typography
      component="button"
      type="button"
      onClick={openEdit}
      disabled={disabled || committing}
      sx={{
        border: 0,
        p: 0,
        m: 0,
        bgcolor: 'transparent',
        cursor: disabled || committing ? 'default' : 'pointer',
        font: 'inherit',
        fontWeight: 800,
        fontSize: '0.82rem',
        color: 'primary.main',
        textDecoration: 'underline',
        textUnderlineOffset: 2,
        '&:hover': disabled || committing ? undefined : { color: 'primary.dark' },
      }}
    >
      {display}
    </Typography>
  )
}

export function BogeumjariLoanDetailDialog({
  open,
  balance,
  annualRatePercent,
  paymentDay,
  monthlyPayment,
  saving,
  onRateCommit,
  onPaymentDayCommit,
  onMonthlyPaymentCommit,
  onClose,
}: Props) {
  const breakdown = calcBogeumjariLoanPaymentBreakdown(balance, annualRatePercent, monthlyPayment)

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
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 800 }}>보금자리론 상세</Typography>
      </FormDialogHeader>

      <DialogContent sx={formDialogContentSx}>
        <Stack spacing={1.25}>
          <Paper
            variant="outlined"
            sx={{
              px: 1.25,
              py: 1.1,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.06 : 0.03),
              borderColor: (theme) => alpha(theme.palette.error.main, 0.14),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.25 }}>
              상품
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>{BOGEUMJARI_LOAN_PRODUCT}</Typography>
          </Paper>

          <Stack spacing={0.85}>
            <DetailRow label="대출일자" value={formatLoanDateKo(BOGEUMJARI_LOAN_START)} />
            <DetailRow label="대출만기" value={formatLoanDateKo(BOGEUMJARI_LOAN_MATURITY)} />
            <DetailRow
              label="금리"
              value={
                <Stack direction="row" alignItems="center" spacing={0.35} justifyContent="flex-end">
                  <Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>고정금리</Typography>
                  <ClickableInlineNumber
                    value={annualRatePercent}
                    display={formatLoanRate(annualRatePercent)}
                    disabled={saving}
                    onCommit={onRateCommit}
                    parse={(raw) => {
                      const normalized = raw.replace(/,/g, '').trim().replace(/%$/, '')
                      const parsed = Number(normalized)
                      if (!Number.isFinite(parsed)) return null
                      return Math.round(Math.min(100, Math.max(0, parsed)) * 100) / 100
                    }}
                  />
                </Stack>
              }
            />
            <DetailRow label="상환방식" value={BOGEUMJARI_LOAN_REPAYMENT} />
            <DetailRow
              label="납부일"
              value={
                <Stack direction="row" alignItems="center" spacing={0.35} justifyContent="flex-end">
                  <Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>매월</Typography>
                  <ClickableInlineNumber
                    value={paymentDay}
                    display={String(paymentDay)}
                    disabled={saving}
                    inputWidth={36}
                    onCommit={onPaymentDayCommit}
                    parse={(raw) => {
                      const parsed = Number(raw.replace(/,/g, '').trim())
                      if (!Number.isFinite(parsed)) return null
                      return Math.min(31, Math.max(1, Math.round(parsed)))
                    }}
                  />
                  <Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>일</Typography>
                </Stack>
              }
            />
            <DetailRow label="대출잔액" value={formatWon(balance)} />
          </Stack>

          <Divider />

          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', mb: 0.75 }}>예상 원리금</Typography>
            <Paper variant="outlined" sx={{ px: 1.25, py: 1, borderRadius: 2 }}>
              <Stack spacing={0.85}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    월 상환액
                  </Typography>
                  <FreshAmountField
                    value={monthlyPayment}
                    onCommit={onMonthlyPaymentCommit}
                    disabled={saving}
                    large
                    softInput="primary"
                  />
                </Box>
                {breakdown ? (
                  <>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        원금
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem' }}>
                        {formatWon(breakdown.principalPart)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        이자
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: 'text.secondary' }}>
                        {formatWon(breakdown.interestPart)}
                      </Typography>
                    </Stack>
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    대출잔액을 입력하면 원금·이자를 계산합니다.
                  </Typography>
                )}
              </Stack>
            </Paper>
            {breakdown ? (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontWeight: 600, display: 'block', mt: 0.75, lineHeight: 1.4 }}
              >
                월 상환액 기준, 다음 회차 원금·이자 예상입니다.
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </DialogContent>
    </AppDialog>
  )
}
