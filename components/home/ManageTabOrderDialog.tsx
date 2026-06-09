'use client'
// 수정: Auto — 2026-06-08

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { formDialogContentSx, formDialogSlotProps } from '@/config/formDialogLayout'
import type { ManageTabId } from '@/lib/manageTabOrder'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'

type TabItem = { id: ManageTabId; label: string }

type Props = {
  open: boolean
  tabs: TabItem[]
  onClose: () => void
  onSave: (order: ManageTabId[]) => void
}

export function ManageTabOrderDialog({ open, tabs, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<TabItem[]>(tabs)
  const [dragId, setDragId] = useState<ManageTabId | null>(null)

  useEffect(() => {
    if (open) setDraft(tabs)
  }, [open, tabs])

  const reorder = (fromId: ManageTabId, toId: ManageTabId) => {
    if (fromId === toId) return
    const fromIndex = draft.findIndex((row) => row.id === fromId)
    const toIndex = draft.findIndex((row) => row.id === toId)
    if (fromIndex < 0 || toIndex < 0) return
    const next = [...draft]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setDraft(next)
  }

  const handleSave = () => {
    onSave(draft.map((row) => row.id))
    onClose()
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={formDialogSlotProps}>
      <FormDialogHeader onClose={onClose}>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>탭 순서</Typography>
      </FormDialogHeader>
      <DialogContent sx={formDialogContentSx}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
          드래그해서 탭 순서를 바꿀 수 있어요
        </Typography>
        <Stack spacing={0.75}>
          {draft.map((tab) => (
            <Box
              key={tab.id}
              draggable
              onDragStart={() => setDragId(tab.id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) reorder(dragId, tab.id)
                setDragId(null)
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1,
                py: 0.75,
                borderRadius: 1.5,
                border: 1,
                borderColor: dragId === tab.id ? 'primary.main' : 'divider',
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                opacity: dragId === tab.id ? 0.65 : 1,
              }}
            >
              <DragIndicatorRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', cursor: 'grab' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{tab.label}</Typography>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} size="small">
          취소
        </Button>
        <Button variant="contained" onClick={handleSave} size="small">
          저장
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
