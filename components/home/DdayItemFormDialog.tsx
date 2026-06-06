'use client'
// 수정: Auto — 2026-06-05 (추가·수정 시 자동 포커스 제거)

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
import type { DdayItem } from '@/hooks/useDdayItems'
import type { DdayItemPayload } from '@/lib/ddayPayload'
import { INTERVAL_UNIT_LABELS, INTERVAL_UNITS, type IntervalUnit } from '@/lib/ddaySchedule'
import { todayIsoDate } from '@/lib/shoppingDate'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  item?: DdayItem | null
  onClose: () => void
  onSubmit: (payload: DdayItemPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

const compactDateFieldSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    required: true,
    fullWidth: true,
  },
}

export function DdayItemFormDialog({ open, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [name, setName] = useState('')
  const [lastVisitDate, setLastVisitDate] = useState<Dayjs | null>(dayjs(todayIsoDate()))
  const [intervalValue, setIntervalValue] = useState('28')
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>('day')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setName('')
      setLastVisitDate(dayjs(todayIsoDate()))
      setIntervalValue('28')
      setIntervalUnit('day')
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      setName(item.name)
      setLastVisitDate(dayjs(item.lastVisitDate))
      setIntervalValue(String(item.intervalValue))
      setIntervalUnit(item.intervalUnit)
    } else {
      setName('')
      setLastVisitDate(dayjs(todayIsoDate()))
      setIntervalValue('28')
      setIntervalUnit('day')
    }
  }, [open, item])

  const canSubmit =
    name.trim() &&
    lastVisitDate?.isValid() &&
    Number.isInteger(Number(intervalValue)) &&
    Number(intervalValue) >= 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting || !lastVisitDate) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        name: name.trim(),
        lastVisitDate: lastVisitDate.format('YYYY-MM-DD'),
        intervalValue: Math.round(Number(intervalValue)),
        intervalUnit,
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
            {isEdit ? '일정 수정' : '일정 추가'}
          </Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="이름"
                placeholder="미용실"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
                margin="dense"
                sx={formDialogFirstFieldSx}
              />
              <DatePicker
                label="마지막 방문일"
                value={lastVisitDate}
                onChange={setLastVisitDate}
                format="YY-MM-DD"
                slotProps={compactDateFieldSlotProps}
              />
              <Stack direction="row" spacing={1}>
                <TextField
                  label="다음 간격"
                  type="number"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  required
                  fullWidth
                  inputProps={{ min: 1, step: 1 }}
                  {...formDialogCompactTextFieldProps}
                />
                <FormControl size="small" margin="dense" sx={{ minWidth: 88 }}>
                  <InputLabel id="interval-unit-label">단위</InputLabel>
                  <Select
                    labelId="interval-unit-label"
                    label="단위"
                    value={intervalUnit}
                    onChange={(e) => setIntervalUnit(e.target.value as IntervalUnit)}
                  >
                    {INTERVAL_UNITS.map((unit) => (
                      <MenuItem key={unit} value={unit} dense>
                        {INTERVAL_UNIT_LABELS[unit]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
                예: 28일 · 5주 · 1달 — 마지막 방문일 기준으로 다음 방문일이 계산됩니다.
              </Typography>
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
