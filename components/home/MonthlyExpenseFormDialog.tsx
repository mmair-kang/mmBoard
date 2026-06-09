'use client'
// 수정: Auto — 2026-06-08

import { MonthlyDaySelect } from '@/components/home/MonthlyDaySelect'
import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { MonthlyExpense } from '@/hooks/useMonthlyExpenses'
import type { MonthlyExpensePayType, MonthlyExpensePayload } from '@/lib/monthlyExpensePayload'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  item?: MonthlyExpense | null
  onClose: () => void
  onSubmit: (payload: MonthlyExpensePayload) => Promise<void>
  onDelete?: () => Promise<void>
}

export function MonthlyExpenseFormDialog({ open, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [title, setTitle] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [payType, setPayType] = useState<MonthlyExpensePayType>('card')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setDayOfMonth(null)
      setAmount('')
      setPayType('card')
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      setTitle(item.title)
      setDayOfMonth(item.dayOfMonth)
      setAmount(String(item.amount))
      setPayType(item.payType)
    } else {
      setTitle('')
      setDayOfMonth(null)
      setAmount('')
      setPayType('card')
    }
  }, [open, item])

  const parsedAmount = Math.round(Number(amount.replace(/[^\d]/g, ''))) || 0
  const canSubmit = Boolean(title.trim()) && parsedAmount >= 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        title: title.trim(),
        dayOfMonth,
        amount: parsedAmount,
        payType,
      })
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '저장에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '삭제에 실패했습니다')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={(e) => void handleSubmit(e)} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {isEdit ? '고정비 수정' : '고정비 추가'}
          </Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <MonthlyDaySelect
                labelId="monthly-expense-day"
                label="일정"
                value={dayOfMonth}
                includeAnytime
                fullWidth
                onChange={setDayOfMonth}
              />
              <TextField
                label="이름"
                placeholder="넷플릭스"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                {...formDialogCompactTextFieldProps}
              />
              <TextField
                label="금액"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                required
                fullWidth
                inputProps={{ inputMode: 'numeric' }}
                InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
                {...formDialogCompactTextFieldProps}
              />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                  결제
                </Typography>
                <RadioGroup
                  row
                  value={payType}
                  onChange={(e) => setPayType(e.target.value as MonthlyExpensePayType)}
                >
                  <FormControlLabel value="card" control={<Radio size="small" />} label="카드" />
                  <FormControlLabel value="cash" control={<Radio size="small" />} label="현금" />
                </RadioGroup>
              </Box>
              {formError ? (
                <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter
          onDelete={isEdit && onDelete ? () => void handleDelete() : undefined}
          deleteLoading={deleting}
          submitLoading={submitting}
          submitDisabled={!canSubmit}
          submitLabel={isEdit ? '저장' : '추가'}
        />
      </Box>
    </AppDialog>
  )
}
