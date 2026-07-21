'use client'
// 수정: Auto — 2026-07-21 22:00 (관리계좌 편집기)

import type { ManagedAccountPayload, ManagedAccountType } from '@/lib/accountPayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'

export type ManagedAccountDraft = ManagedAccountPayload & {
  key: string
}

export function managedAccountsToDrafts(
  accounts: Array<{ id: number; name: string; accountType: ManagedAccountType }>,
): ManagedAccountDraft[] {
  return accounts.map((row) => ({
    key: `id-${row.id}`,
    id: row.id,
    name: row.name,
    accountType: row.accountType,
  }))
}

export function draftsToManagedAccounts(drafts: ManagedAccountDraft[]): ManagedAccountPayload[] {
  return drafts
    .filter((row) => Boolean(row.name?.trim()))
    .map(({ key: _key, ...row }) => ({
      ...row,
      name: row.name.trim(),
      accountType: row.accountType === 'subscription' ? 'subscription' : 'general',
    }))
}

type Props = {
  drafts: ManagedAccountDraft[]
  onChange: (drafts: ManagedAccountDraft[]) => void
}

export function ManagedAccountsEditor({ drafts, onChange }: Props) {
  const [dragKey, setDragKey] = useState<string | null>(null)

  const updateDraft = (key: string, patch: Partial<ManagedAccountDraft>) => {
    onChange(drafts.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const removeDraft = (key: string) => {
    onChange(drafts.filter((row) => row.key !== key))
  }

  const addDraft = () => {
    onChange([
      ...drafts,
      {
        key: `new-${Date.now()}`,
        name: '',
        accountType: 'general',
      },
    ])
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
    <Stack spacing={1}>
      {drafts.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
          관리계좌가 없습니다. 아래 버튼으로 추가해 보세요.
        </Typography>
      ) : (
        <>
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
                borderColor: dragKey === draft.key ? 'success.main' : 'divider',
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                opacity: dragKey === draft.key ? 0.65 : 1,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                <DragIndicatorRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', cursor: 'grab' }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', flex: 1 }}>관리계좌</Typography>
                <IconButton size="small" onClick={() => removeDraft(draft.key)} aria-label="삭제">
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Stack spacing={0.75}>
                <TextField
                  label="계좌명"
                  placeholder="성남사랑"
                  size="small"
                  margin="dense"
                  fullWidth
                  value={draft.name}
                  onChange={(e) => updateDraft(draft.key, { name: e.target.value })}
                  required
                />
                <FormControl size="small" fullWidth margin="dense">
                  <InputLabel id={`managed-type-${draft.key}`}>타입</InputLabel>
                  <Select
                    labelId={`managed-type-${draft.key}`}
                    label="타입"
                    value={draft.accountType}
                    onChange={(e) =>
                      updateDraft(draft.key, {
                        accountType: e.target.value as ManagedAccountType,
                      })
                    }
                  >
                    <MenuItem value="general">일반</MenuItem>
                    <MenuItem value="subscription">청약통장</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          ))}
        </>
      )}
      <Button size="small" startIcon={<AddRoundedIcon />} onClick={addDraft} sx={{ alignSelf: 'flex-start' }}>
        계좌 추가
      </Button>
    </Stack>
  )
}
