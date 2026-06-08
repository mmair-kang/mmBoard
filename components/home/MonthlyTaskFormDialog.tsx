'use client'
// 수정: Auto — 2026-06-08

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
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
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

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1)

export function MonthlyTaskFormDialog({ open, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [title, setTitle] = useState('')
  const [dayMode, setDayMode] = useState<'anytime' | 'specific'>('anytime')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [optionType, setOptionType] = useState<MonthlyTaskOptionType>('switch')
  const [targetAmount, setTargetAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setDayMode('anytime')
      setDayOfMonth('1')
      setOptionType('switch')
      setTargetAmount('')
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      setTitle(item.title)
      if (item.dayOfMonth != null) {
        setDayMode('specific')
        setDayOfMonth(String(item.dayOfMonth))
      } else {
        setDayMode('anytime')
        setDayOfMonth('1')
      }
      setOptionType(item.optionType)
      setTargetAmount(item.targetAmount != null ? String(item.targetAmount) : '')
    } else {
      setTitle('')
      setDayMode('anytime')
      setDayOfMonth('1')
      setOptionType('switch')
      setTargetAmount('')
    }
  }, [open, item])

  const canSubmit =
    title.trim() &&
    (dayMode === 'anytime' || (Number.isInteger(Number(dayOfMonth)) && Number(dayOfMonth) >= 1)) &&
    (optionType !== 'card_target' ||
      (Number.isFinite(Number(targetAmount.replace(/,/g, ''))) &&
        Number(targetAmount.replace(/,/g, '')) >= 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        title: title.trim(),
        dayOfMonth: dayMode === 'specific' ? Math.round(Number(dayOfMonth)) : null,
        optionType,
        targetAmount:
          optionType === 'card_target'
            ? Math.round(Number(targetAmount.replace(/,/g, '')))
            : null,
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
      maxWidth="xs"
      disableAutoFocus
      slotProps={formDialogSlotProps}
    >
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {isEdit ? '할일 수정' : '할일 추가'}
          </Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="제목"
                placeholder="카드 실적 채우기"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                size="small"
                margin="dense"
                sx={formDialogFirstFieldSx}
              />

              <FormControl size="small" margin="dense" fullWidth>
                <InputLabel id="day-mode-label">일정</InputLabel>
                <Select
                  labelId="day-mode-label"
                  label="일정"
                  value={dayMode}
                  onChange={(e) => setDayMode(e.target.value as 'anytime' | 'specific')}
                >
                  <MenuItem value="anytime" dense>
                    이번 달 안에
                  </MenuItem>
                  <MenuItem value="specific" dense>
                    매달 특정일
                  </MenuItem>
                </Select>
              </FormControl>

              {dayMode === 'specific' ? (
                <FormControl size="small" margin="dense" fullWidth>
                  <InputLabel id="day-of-month-label">날짜</InputLabel>
                  <Select
                    labelId="day-of-month-label"
                    label="날짜"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                  >
                    {DAY_OPTIONS.map((day) => (
                      <MenuItem key={day} value={String(day)} dense>
                        매달 {day}일
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                  옵션
                </Typography>
                <RadioGroup
                  value={optionType}
                  onChange={(e) => setOptionType(e.target.value as MonthlyTaskOptionType)}
                >
                  <FormControlLabel
                    value="card_target"
                    control={<Radio size="small" />}
                    label="카드 실적 (목표 금액)"
                  />
                  <FormControlLabel
                    value="switch"
                    control={<Radio size="small" />}
                    label="완료 여부 (스위치)"
                  />
                </RadioGroup>
              </Box>

              {optionType === 'card_target' ? (
                <TextField
                  label="목표 금액"
                  placeholder="3000000"
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
