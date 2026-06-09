'use client'
// 수정: Auto — 2026-06-08

import { AnnualDayModeSelect, AnnualMonthSelect } from '@/components/home/AnnualScheduleSelect'
import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFirstFieldSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { AnnualPaymentPayload } from '@/lib/annualPaymentPayload'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: AnnualPaymentPayload) => Promise<void>
}

export function AnnualPaymentFormDialog({ open, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [month, setMonth] = useState(1)
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setMonth(1)
      setDayOfMonth(null)
      setAmount('')
      setSubmitting(false)
      setFormError(null)
    }
  }, [open])

  const canSubmit =
    title.trim() &&
    Number.isFinite(Number(amount.replace(/,/g, ''))) &&
    Number(amount.replace(/,/g, '')) >= 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        title: title.trim(),
        month,
        dayOfMonth,
        amount: Math.round(Number(amount.replace(/,/g, ''))),
      })
      onClose()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableAutoFocus slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>연납 추가</Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="항목명"
                placeholder="자동차보험"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                size="small"
                margin="dense"
                sx={formDialogFirstFieldSx}
              />
              <Stack direction="row" spacing={0.75}>
                <AnnualMonthSelect labelId="annual-add-month" value={month} onChange={setMonth} fullWidth />
                <AnnualDayModeSelect
                  labelId="annual-add-day"
                  dayOfMonth={dayOfMonth}
                  onChange={setDayOfMonth}
                  fullWidth
                />
              </Stack>
              <TextField
                label="금액"
                placeholder="500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                required
                fullWidth
                inputProps={{ inputMode: 'numeric' }}
                InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
                {...formDialogCompactTextFieldProps}
              />
              {formError ? (
                <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter submitLoading={submitting} submitDisabled={!canSubmit} submitLabel="추가" />
      </Box>
    </AppDialog>
  )
}
