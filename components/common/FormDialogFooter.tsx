'use client'
// 수정: Auto — 2026-06-05

import { FormDialogSubmitButton } from '@/components/common/FormDialogSubmitButton'
import { formDialogActionsSx, formDialogDeleteButtonSx } from '@/config/formDialogLayout'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import { ReactNode } from 'react'

type Props = {
  onDelete?: () => void
  deleteLoading?: boolean
  deleteDisabled?: boolean
  submitLoading: boolean
  submitDisabled?: boolean
  submitLabel: ReactNode
}

export function FormDialogFooter({
  onDelete,
  deleteLoading = false,
  deleteDisabled = false,
  submitLoading,
  submitDisabled,
  submitLabel,
}: Props) {
  const footerBusy = submitLoading || deleteLoading

  return (
    <DialogActions sx={formDialogActionsSx}>
      {onDelete ? (
        <Button
          type="button"
          variant="outlined"
          color="error"
          onClick={onDelete}
          disabled={deleteDisabled || footerBusy}
          size="small"
          sx={formDialogDeleteButtonSx}
        >
          {deleteLoading ? '삭제 중…' : '삭제'}
        </Button>
      ) : (
        <Box />
      )}
      <FormDialogSubmitButton
        loading={submitLoading}
        disabled={submitDisabled || deleteLoading}
        size="small"
      >
        {submitLabel}
      </FormDialogSubmitButton>
    </DialogActions>
  )
}
