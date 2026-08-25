'use client'
// 수정: Auto — 2026-08-25 00:50 (방 정렬·추가·삭제)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import { ORGANIZE_ROOM_LABEL_MAX, type OrganizeRoomRecord } from '@/config/organizeCabinets'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'

type DraftRoom = OrganizeRoomRecord & { draftLabel: string }

type Props = {
  open: boolean
  rooms: OrganizeRoomRecord[]
  onClose: () => void
  onSaveOrder: (keys: string[]) => Promise<void>
  onAdd: (label: string) => Promise<void>
  onRename: (key: string, label: string) => Promise<void>
  onDelete: (key: string) => Promise<void>
}

export function OrganizeRoomsDialog({ open, rooms, onClose, onSaveOrder, onAdd, onRename, onDelete }: Props) {
  const [draft, setDraft] = useState<DraftRoom[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDraft(rooms.map((room) => ({ ...room, draftLabel: room.label })))
    setNewLabel('')
    setError(null)
    setBusy(false)
  }, [open, rooms])

  const reorder = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return
    const fromIndex = draft.findIndex((row) => row.key === fromKey)
    const toIndex = draft.findIndex((row) => row.key === toKey)
    if (fromIndex < 0 || toIndex < 0) return
    const next = [...draft]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setDraft(next)
  }

  const handleSave = async () => {
    setBusy(true)
    setError(null)
    try {
      for (const room of draft) {
        const trimmed = room.draftLabel.replace(/[\r\n]+/g, ' ').trim()
        if (!trimmed) {
          setError('방 이름을 입력해 주세요.')
          setBusy(false)
          return
        }
        if (trimmed !== room.label) {
          await onRename(room.key, trimmed)
        }
      }
      await onSaveOrder(draft.map((room) => room.key))
      onClose()
    } catch {
      setError('저장하지 못했습니다.')
      setBusy(false)
    }
  }

  const handleAdd = async () => {
    const trimmed = newLabel.replace(/[\r\n]+/g, ' ').trim()
    if (!trimmed) {
      setError('방 이름을 입력해 주세요.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onAdd(trimmed)
      setNewLabel('')
      setBusy(false)
    } catch {
      setError('추가하지 못했습니다.')
      setBusy(false)
    }
  }

  const handleDelete = async (key: string) => {
    if (draft.length <= 1) {
      setError('방은 최소 1개 필요합니다.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onDelete(key)
      setBusy(false)
    } catch {
      setError('삭제하지 못했습니다.')
      setBusy(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={formDialogSlotProps}>
      <FormDialogHeader onClose={onClose}>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>방 관리</Typography>
      </FormDialogHeader>
      <DialogContent sx={formDialogContentSx}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
          드래그로 순서를 바꾸고, 이름을 수정하거나 추가·삭제할 수 있어요
        </Typography>
        <Stack spacing={0.75}>
          {draft.map((room) => (
            <Box
              key={room.key}
              draggable={!busy}
              onDragStart={() => setDragKey(room.key)}
              onDragEnd={() => setDragKey(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragKey) reorder(dragKey, room.key)
                setDragKey(null)
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.75,
                py: 0.5,
                borderRadius: 1.5,
                border: 1,
                borderColor: dragKey === room.key ? 'primary.main' : 'divider',
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                opacity: dragKey === room.key ? 0.65 : 1,
              }}
            >
              <DragIndicatorRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', cursor: 'grab', flexShrink: 0 }} />
              <TextField
                {...formDialogCompactTextFieldProps}
                fullWidth
                value={room.draftLabel}
                disabled={busy}
                onChange={(event) => {
                  const value = event.target.value
                  setDraft((prev) =>
                    prev.map((row) => (row.key === room.key ? { ...row, draftLabel: value } : row)),
                  )
                }}
                slotProps={{ htmlInput: { maxLength: ORGANIZE_ROOM_LABEL_MAX } }}
              />
              <IconButton
                size="small"
                aria-label={`${room.label} 삭제`}
                disabled={busy || draft.length <= 1}
                onClick={() => void handleDelete(room.key)}
                sx={{ color: 'error.main' }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.5 }}>
          <TextField
            {...formDialogCompactTextFieldProps}
            fullWidth
            label="새 방"
            placeholder="예: 작은방"
            value={newLabel}
            disabled={busy}
            onChange={(event) => setNewLabel(event.target.value)}
            slotProps={{ htmlInput: { maxLength: ORGANIZE_ROOM_LABEL_MAX } }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddRoundedIcon />}
            disabled={busy}
            onClick={() => void handleAdd()}
            sx={{ flexShrink: 0, height: 34 }}
          >
            추가
          </Button>
        </Stack>

        {error ? (
          <Typography color="error" fontSize="0.8rem" fontWeight={700} sx={{ mt: 1 }}>
            {error}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button onClick={onClose} size="small" disabled={busy}>
          취소
        </Button>
        <Button variant="contained" onClick={() => void handleSave()} size="small" disabled={busy}>
          {busy ? '저장 중…' : '저장'}
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
