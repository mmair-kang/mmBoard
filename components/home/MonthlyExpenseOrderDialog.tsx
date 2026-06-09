'use client'
// 수정: Auto — 2026-06-08

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { formDialogContentSx, formDialogSlotProps } from '@/config/formDialogLayout'
import type { MonthlyExpense } from '@/hooks/useMonthlyExpenses'
import { formatWon } from '@/lib/annualPaymentCalc'
import { formatMonthlyDayLabel } from '@/lib/monthlyDayLabel'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  items: MonthlyExpense[]
  onClose: () => void
  onSave: (order: number[]) => Promise<void>
}

export function MonthlyExpenseOrderDialog({ open, items, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<MonthlyExpense[]>(items)
  const [dragId, setDragId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setDraft(items)
  }, [open, items])

  const reorder = (fromId: number, toId: number) => {
    if (fromId === toId) return
    const fromIndex = draft.findIndex((row) => row.id === fromId)
    const toIndex = draft.findIndex((row) => row.id === toId)
    if (fromIndex < 0 || toIndex < 0) return
    const next = [...draft]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setDraft(next)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(draft.map((row) => row.id))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={formDialogSlotProps}>
      <FormDialogHeader onClose={onClose} closeDisabled={saving}>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>목록 순서</Typography>
      </FormDialogHeader>
      <DialogContent sx={formDialogContentSx}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
          드래그해서 고정비 순서를 바꿀 수 있어요
        </Typography>
        <Stack spacing={0.75}>
          {draft.map((item) => (
            <Box
              key={item.id}
              draggable
              onDragStart={() => setDragId(item.id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId != null) reorder(dragId, item.id)
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
                borderColor: dragId === item.id ? 'primary.main' : 'divider',
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                opacity: dragId === item.id ? 0.65 : 1,
              }}
            >
              <DragIndicatorRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', cursor: 'grab', flexShrink: 0 }} />
              <Chip
                size="small"
                label={formatMonthlyDayLabel(item.dayOfMonth)}
                sx={{ height: 20, fontWeight: 800, fontSize: '0.62rem', flexShrink: 0 }}
                variant="outlined"
              />
              <Typography
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
                {formatWon(item.amount)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} size="small" disabled={saving}>
          취소
        </Button>
        <Button variant="contained" onClick={() => void handleSave()} size="small" disabled={saving}>
          {saving ? '저장 중…' : '저장'}
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
