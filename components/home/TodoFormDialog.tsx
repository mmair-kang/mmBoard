'use client'
// 수정: Auto — 2026-06-11

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
import type { TodoItem } from '@/hooks/useTodos'
import type { TodoItemPayload } from '@/lib/todoPayload'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  item?: TodoItem | null
  onClose: () => void
  onSubmit: (payload: TodoItemPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

const compactDateFieldSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    fullWidth: true,
  },
  field: { clearable: true },
}

const compactTimeFieldSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    fullWidth: true,
  },
  field: { clearable: true },
}

export function TodoFormDialog({ open, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [content, setContent] = useState('')
  const [dueDate, setDueDate] = useState<Dayjs | null>(null)
  const [dueTime, setDueTime] = useState<Dayjs | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setContent('')
      setDueDate(null)
      setDueTime(null)
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      setContent(item.content)
      setDueDate(item.dueDate ? dayjs(item.dueDate) : null)
      setDueTime(item.dueTime ? dayjs(`2000-01-01T${item.dueTime}`) : null)
    } else {
      setContent('')
      setDueDate(null)
      setDueTime(null)
    }
  }, [open, item])

  const canSubmit = content.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        content: content.trim(),
        dueDate: dueDate?.isValid() ? dueDate.format('YYYY-MM-DD') : null,
        dueTime: dueTime?.isValid() ? dueTime.format('HH:mm') : null,
      })
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '저장에 실패했습니다.')
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
      <Box component="form" onSubmit={(e) => void handleSubmit(e)} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {isEdit ? '할 일 수정' : '할 일 추가'}
          </Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="내용"
                placeholder="할 일을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                fullWidth
                multiline
                minRows={2}
                {...formDialogCompactTextFieldProps}
                sx={formDialogFirstFieldSx}
              />
              <DatePicker
                label="날짜 (선택)"
                value={dueDate}
                onChange={setDueDate}
                format="YY-MM-DD"
                slotProps={compactDateFieldSlotProps}
              />
              <TimePicker
                label="시간 (선택)"
                value={dueTime}
                onChange={setDueTime}
                format="HH:mm"
                ampm={false}
                slotProps={compactTimeFieldSlotProps}
              />
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
