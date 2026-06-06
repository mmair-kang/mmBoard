'use client'
// 수정: Auto — 2026-06-05

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { CollectionMainKey } from '@/config/collectionCategories'
import { getCollectionMainMeta } from '@/config/collectionCategories'
import type { CollectionSubEntry } from '@/config/collectionCategories'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

type EditRow = { rowId: string; key: string | null; label: string }

type Props = {
  open: boolean
  mainCategory: CollectionMainKey
  subs: CollectionSubEntry[]
  onClose: () => void
  onSave: (rows: { key?: string | null; label: string }[]) => Promise<CollectionSubEntry[]>
}

function toEditRows(subs: CollectionSubEntry[]): EditRow[] {
  return subs.map((s, i) => ({
    rowId: s.key || `row_${i}`,
    key: s.key,
    label: s.label,
  }))
}

export function CollectionSubcategoryEditDialog({
  open,
  mainCategory,
  subs,
  onClose,
  onSave,
}: Props) {
  const mainMeta = getCollectionMainMeta(mainCategory)
  const [rows, setRows] = useState<EditRow[]>(() => toEditRows(subs))
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setRows(toEditRows(subs))
    setDragIndex(null)
    setSaving(false)
    setError('')
  }, [open, subs])

  const moveRow = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= rows.length || to >= rows.length) return
    setRows((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await onSave(rows.map((r) => ({ key: r.key, label: r.label })))
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleSave()
  }

  const canDelete = rows.length > 1

  return (
    <AppDialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs" slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={saving}>
        <Typography component="span" sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.35 }}>
          {mainMeta.label} · 작은 카테고리
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
          이름 수정 · 드래그로 순서 변경
        </Typography>
      </FormDialogHeader>

      <DialogContent sx={formDialogContentSx}>
        <Box sx={formDialogContentScrollSx}>
          <Stack spacing={1}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            {rows.map((row, index) => (
              <Box
                key={row.rowId}
                draggable={!saving}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (dragIndex == null || dragIndex === index) return
                  moveRow(dragIndex, index)
                  setDragIndex(index)
                }}
                onDragEnd={() => setDragIndex(null)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.25,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: dragIndex === index ? 'action.hover' : 'transparent',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.disabled',
                    cursor: saving ? 'default' : 'grab',
                    touchAction: 'none',
                  }}
                >
                  <DragIndicatorRoundedIcon fontSize="small" />
                </Box>
                <TextField
                  {...formDialogCompactTextFieldProps}
                  value={row.label}
                  onChange={(e) => {
                    const label = e.target.value
                    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, label } : r)))
                  }}
                  placeholder="카테고리 이름"
                  fullWidth
                  disabled={saving}
                />
                <IconButton
                  size="small"
                  aria-label="항목 삭제"
                  disabled={!canDelete || saving}
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                  sx={{ color: 'text.secondary' }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              disabled={saving}
              onClick={() =>
                setRows((prev) => [
                  ...prev,
                  { rowId: `new_${Date.now()}`, key: null, label: '' },
                ])
              }
              sx={{ alignSelf: 'flex-start', mt: 0.5 }}
            >
              항목 추가
            </Button>
          </Stack>
        </Box>
      </DialogContent>

        <FormDialogFooter
          submitLoading={saving}
          submitDisabled={rows.some((r) => !r.label.trim())}
          submitLabel="저장"
        />
      </Box>
    </AppDialog>
  )
}
