'use client'
// 수정: Auto — 2026-08-24 23:25 (메인 4단 제목)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFirstFieldSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import { ORGANIZE_CELL_CONTENT_MAX, organizeCellTitle, type OrganizeCabinetConfig } from '@/config/organizeCabinets'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import { useEffect, useState } from 'react'

export type OrganizeCellTarget = {
  cabinet: OrganizeCabinetConfig
  rowIndex: number
  colIndex: number
  content: string
}

type Props = {
  open: boolean
  target: OrganizeCellTarget | null
  onClose: () => void
  onSubmit: (content: string) => Promise<void>
}

export function OrganizeCellDialog({ open, target, onClose, onSubmit }: Props) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !target) {
      setContent('')
      setSubmitting(false)
      setFormError(null)
      return
    }
    setContent(target.content)
  }, [open, target])

  const title = target
    ? organizeCellTitle(target.cabinet, target.rowIndex, target.colIndex)
    : '칸 내용'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next = content.replace(/[\r\n]+/g, ' ').trim()
    if (next.length > ORGANIZE_CELL_CONTENT_MAX) {
      setFormError(`${ORGANIZE_CELL_CONTENT_MAX}자 이내로 입력해 주세요.`)
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit(next)
    } catch {
      setFormError('저장하지 못했습니다.')
      setSubmitting(false)
    }
  }

  const handleClear = async () => {
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit('')
    } catch {
      setFormError('비우지 못했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose}>{title}</FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <TextField
              {...formDialogCompactTextFieldProps}
              autoFocus
              fullWidth
              label="내용"
              placeholder="한 줄로 적어 주세요"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              slotProps={{ htmlInput: { maxLength: ORGANIZE_CELL_CONTENT_MAX } }}
              error={Boolean(formError)}
              helperText={formError ?? ' '}
              sx={formDialogFirstFieldSx}
            />
          </Box>
        </DialogContent>
        <FormDialogFooter
          onDelete={target?.content ? handleClear : undefined}
          submitLoading={submitting}
          submitLabel="저장"
        />
      </Box>
    </AppDialog>
  )
}
