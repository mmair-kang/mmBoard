'use client'
// 수정: Auto — 2026-06-08

import { MonthlyDaySelect } from '@/components/home/MonthlyDaySelect'
import type { CardExtraPayload } from '@/lib/monthlyTaskCardExtraPayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'

export type CardExtraDraft = CardExtraPayload & {
  key: string
}

function newDraft(): CardExtraDraft {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    extraType: 'payment_switch',
    title: '',
    dayOfMonth: 1,
    amount: 0,
  }
}

export function cardExtrasToDrafts(
  extras: Array<{
    id: number
    extraType: string
    title: string | null
    dayOfMonth: number | null
    amount: number
  }>,
): CardExtraDraft[] {
  return extras.map((extra) => ({
    key: `id-${extra.id}`,
    id: extra.id,
    extraType: 'payment_switch',
    title: extra.title ?? '',
    dayOfMonth: extra.dayOfMonth,
    amount: extra.amount,
  }))
}

export function draftsToCardExtras(drafts: CardExtraDraft[]): CardExtraPayload[] {
  return drafts
    .filter((row) => row.amount > 0 && Boolean(row.title?.trim()))
    .map(({ key: _key, ...row }) => ({
      ...row,
      extraType: 'payment_switch' as const,
      title: row.title!.trim(),
    }))
}

type Props = {
  drafts: CardExtraDraft[]
  onChange: (drafts: CardExtraDraft[]) => void
}

export function CardExtrasEditor({ drafts, onChange }: Props) {
  const [dragKey, setDragKey] = useState<string | null>(null)

  const addDraft = () => {
    onChange([...drafts, newDraft()])
  }

  const updateDraft = (key: string, patch: Partial<CardExtraDraft>) => {
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

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
          결제 예정 목록
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={addDraft}
          sx={{ fontSize: '0.72rem', py: 0.25 }}
        >
          결제 예정
        </Button>
      </Stack>

      {drafts.length === 0 ? (
        <Box
          sx={{
            py: 1.5,
            px: 1.25,
            borderRadius: 1.5,
            border: 1,
            borderStyle: 'dashed',
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
            결제 예정 항목을 추가하세요. OFF면 필요 금액에서 차감되고, ON이면 실적에 반영한 것으로 봅니다.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, px: 0.25 }}>
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
                <DragIndicatorRoundedIcon
                  sx={{ fontSize: 20, color: 'text.disabled', cursor: 'grab', flexShrink: 0 }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', flex: 1 }}>결제 예정</Typography>
                <IconButton size="small" onClick={() => removeDraft(draft.key)} aria-label="삭제">
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={0.75}>
                  <MonthlyDaySelect
                    labelId={`day-${draft.key}`}
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
                  placeholder="KT"
                  size="small"
                  margin="dense"
                  fullWidth
                  value={draft.title ?? ''}
                  onChange={(e) => updateDraft(draft.key, { title: e.target.value })}
                  required
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}
