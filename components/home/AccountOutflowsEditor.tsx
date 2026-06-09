'use client'
// 수정: Auto — 2026-06-08

import { MonthlyDaySelect } from '@/components/home/MonthlyDaySelect'
import type { OutflowPayload } from '@/lib/accountPayload'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'

export type OutflowDraft = OutflowPayload & {
  key: string
}

export function outflowsToDrafts(
  outflows: Array<{
    id: number
    dayOfMonth: number | null
    title: string
    amount: number
  }>,
): OutflowDraft[] {
  return outflows.map((row) => ({
    key: `id-${row.id}`,
    id: row.id,
    dayOfMonth: row.dayOfMonth,
    title: row.title,
    amount: row.amount,
  }))
}

export function draftsToOutflows(drafts: OutflowDraft[]): OutflowPayload[] {
  return drafts
    .filter((row) => row.amount > 0 && Boolean(row.title?.trim()))
    .map(({ key: _key, ...row }) => ({
      ...row,
      title: row.title.trim(),
    }))
}

type Props = {
  drafts: OutflowDraft[]
  onChange: (drafts: OutflowDraft[]) => void
}

export function AccountOutflowsEditor({ drafts, onChange }: Props) {
  const [dragKey, setDragKey] = useState<string | null>(null)

  const updateDraft = (key: string, patch: Partial<OutflowDraft>) => {
    onChange(drafts.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const removeDraft = (key: string) => {
    onChange(drafts.filter((row) => row.key !== key))
  }

  const reorder = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return
    const fromIndex = drafts.findIndex((row) => row.key === fromKey)
    const toIndex = drafts.findIndex((row) => row.key === toKey)
    if (fromIndex < 0 || toIndex < 0) return
    const next = [...drafts]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onChange(next)
  }

  if (drafts.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
        출금 예정 항목이 없습니다.
      </Typography>
    )
  }

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        드래그해서 순서를 바꿀 수 있어요
      </Typography>
      {drafts.map((draft) => (
        <Box
          key={draft.key}
          draggable
          onDragStart={() => setDragKey(draft.key)}
          onDragEnd={() => setDragKey(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragKey) reorder(dragKey, draft.key)
            setDragKey(null)
          }}
          sx={{
            p: 1,
            borderRadius: 1.5,
            border: 1,
            borderColor: dragKey === draft.key ? 'primary.main' : 'divider',
            bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
            opacity: dragKey === draft.key ? 0.65 : 1,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
            <DragIndicatorRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', cursor: 'grab' }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', flex: 1 }}>출금 예정</Typography>
            <IconButton size="small" onClick={() => removeDraft(draft.key)} aria-label="삭제">
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack spacing={0.75}>
            <Stack direction="row" spacing={0.75}>
              <MonthlyDaySelect
                labelId={`outflow-day-${draft.key}`}
                label="일"
                value={draft.dayOfMonth}
                includeAnytime
                onChange={(dayOfMonth) => updateDraft(draft.key, { dayOfMonth })}
              />
              <TextField
                label="금액"
                size="small"
                margin="dense"
                fullWidth
                value={draft.amount > 0 ? String(draft.amount) : ''}
                onChange={(e) =>
                  updateDraft(draft.key, {
                    amount: Math.round(Number(e.target.value.replace(/[^\d]/g, ''))) || 0,
                  })
                }
                inputProps={{ inputMode: 'numeric' }}
                InputProps={{ endAdornment: <Typography variant="caption">원</Typography> }}
              />
            </Stack>
            <TextField
              label="항목명"
              placeholder="롯데카드"
              size="small"
              margin="dense"
              fullWidth
              value={draft.title}
              onChange={(e) => updateDraft(draft.key, { title: e.target.value })}
              required
            />
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
