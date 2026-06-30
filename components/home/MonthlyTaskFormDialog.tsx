'use client'
// 수정: Auto — 2026-06-30 (card_benefit 혜택금액 옵션)

import {
  CardExtrasEditor,
  cardExtrasToDrafts,
  draftsToCardExtras,
  type CardExtraDraft,
} from '@/components/home/CardExtrasEditor'
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
  formDialogFirstFieldSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { MonthlyTask } from '@/hooks/useMonthlyTasks'
import type { MonthlyTaskOptionType, MonthlyTaskPayload } from '@/lib/monthlyTaskPayload'
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
  item?: MonthlyTask | null
  onClose: () => void
  onSubmit: (payload: MonthlyTaskPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

function validateCardExtras(drafts: CardExtraDraft[]): boolean {
  return drafts.every((row) => row.amount >= 1 && Boolean(row.title?.trim()))
}

export function MonthlyTaskFormDialog({ open, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [title, setTitle] = useState('')
  const [taskDayOfMonth, setTaskDayOfMonth] = useState<number | null>(null)
  const [optionType, setOptionType] = useState<MonthlyTaskOptionType>('switch')
  const [targetAmount, setTargetAmount] = useState('')
  const [cardExtraDrafts, setCardExtraDrafts] = useState<CardExtraDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setTaskDayOfMonth(null)
      setOptionType('switch')
      setTargetAmount('')
      setCardExtraDrafts([])
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      setTitle(item.title)
      setTaskDayOfMonth(item.dayOfMonth)
      setOptionType(item.optionType)
      setTargetAmount(item.targetAmount != null ? String(item.targetAmount) : '')
      setCardExtraDrafts(cardExtrasToDrafts(item.cardExtras ?? []))
    } else {
      setTitle('')
      setTaskDayOfMonth(null)
      setOptionType('switch')
      setTargetAmount('')
      setCardExtraDrafts([])
    }
  }, [open, item])

  const cardExtrasValid = optionType !== 'card_target' || validateCardExtras(cardExtraDrafts)
  const needsAmount = optionType === 'card_target' || optionType === 'card_benefit'

  const canSubmit =
    title.trim() &&
    (!needsAmount ||
      (Number.isFinite(Number(targetAmount.replace(/,/g, ''))) &&
        Number(targetAmount.replace(/,/g, '')) >= 1)) &&
    cardExtrasValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        title: title.trim(),
        dayOfMonth: taskDayOfMonth,
        optionType,
        targetAmount:
          needsAmount ? Math.round(Number(targetAmount.replace(/,/g, ''))) : null,
        cardExtras: optionType === 'card_target' ? draftsToCardExtras(cardExtraDrafts) : [],
      })
      onClose()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || deleting) return
    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={optionType === 'card_target' ? 'sm' : 'xs'}
      disableAutoFocus
      slotProps={formDialogSlotProps}
    >
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {isEdit ? '카드 수정' : '카드 추가'}
          </Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="제목"
                placeholder="롯데카드 1834"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                size="small"
                margin="dense"
                sx={formDialogFirstFieldSx}
              />

              <MonthlyDaySelect
                labelId="task-day-label"
                label="일정"
                value={taskDayOfMonth}
                includeAnytime
                fullWidth
                onChange={setTaskDayOfMonth}
              />

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                  옵션
                </Typography>
                <RadioGroup
                  value={optionType}
                  onChange={(e) => {
                    const next = e.target.value as MonthlyTaskOptionType
                    setOptionType(next)
                    if (next !== 'card_target') setCardExtraDrafts([])
                    if (next === 'card_benefit' && !targetAmount) setTargetAmount('400000')
                  }}
                >
                  <FormControlLabel
                    value="card_target"
                    control={<Radio size="small" />}
                    label="카드 실적 (목표 금액)"
                  />
                  <FormControlLabel
                    value="card_benefit"
                    control={<Radio size="small" />}
                    label="카드 실적 (혜택 금액)"
                  />
                  <FormControlLabel
                    value="switch"
                    control={<Radio size="small" />}
                    label="완료 여부 (스위치)"
                  />
                </RadioGroup>
              </Box>

              {optionType === 'card_target' ? (
                <>
                  <TextField
                    label="목표 금액"
                    placeholder="500000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value.replace(/[^\d]/g, ''))}
                    required
                    fullWidth
                    inputProps={{ inputMode: 'numeric' }}
                    InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
                    {...formDialogCompactTextFieldProps}
                  />
                  <CardExtrasEditor drafts={cardExtraDrafts} onChange={setCardExtraDrafts} />
                </>
              ) : null}

              {optionType === 'card_benefit' ? (
                <TextField
                  label="혜택 금액"
                  placeholder="400000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value.replace(/[^\d]/g, ''))}
                  required
                  fullWidth
                  inputProps={{ inputMode: 'numeric' }}
                  InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
                  {...formDialogCompactTextFieldProps}
                />
              ) : null}

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
