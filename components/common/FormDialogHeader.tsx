'use client'
// 수정: Auto — 2026-06-05

import { formDialogTitleSx } from '@/config/formDialogLayout'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  onClose: () => void
  closeDisabled?: boolean
}

export function FormDialogHeader({ children, onClose, closeDisabled }: Props) {
  return (
    <DialogTitle
      sx={{
        ...formDialogTitleSx,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        pr: 1.25,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>{children}</Box>
      <IconButton
        onClick={onClose}
        disabled={closeDisabled}
        aria-label="닫기"
        size="small"
        sx={{ mt: 0.15, flexShrink: 0, color: 'text.secondary' }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
  )
}
