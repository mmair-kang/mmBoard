'use client'
// 수정: Auto — 2026-06-11

import { DdayItemCard } from '@/components/home/DdayItemCard'
import { DdayItemFormDialog } from '@/components/home/DdayItemFormDialog'
import { ddayColorForIndex } from '@/config/ddayColors'
import { type DdayItem, useDdayItems } from '@/hooks/useDdayItems'
import { readApiErrorMessage } from '@/lib/apiResponse'
import type { DdayItemPayload } from '@/lib/ddayPayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'

export function DdayWidget() {
  const { items, isLoading, mutate } = useDdayItems()
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DdayItem | null>(null)

  const openAdd = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: DdayItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: DdayItemPayload) => {
    const res = await fetch('/api/dday-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const created = (await res.json()) as DdayItem
    await mutate((prev) => [created, ...(prev ?? [])], { revalidate: false })
  }

  const handleUpdate = async (payload: DdayItemPayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/dday-items/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as DdayItem
    await mutate(
      (prev) => (prev ?? []).map((row) => (row.id === updated.id ? updated : row)),
      { revalidate: false },
    )
  }

  const handleDelete = async () => {
    if (!editingItem) return
    const id = editingItem.id
    await mutate((prev) => (prev ?? []).filter((row) => row.id !== id), { revalidate: false })
    await fetch(`/api/dday-items/${id}`, { method: 'DELETE' })
  }

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          borderColor: 'divider',
          bgcolor: (theme) =>
            alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.1 : 0.03),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 0.85,
            py: 0.4,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: (theme) =>
              alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.16 : 0.07),
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: '0.8rem', lineHeight: 1.2 }}>D-day</Typography>
          <Tooltip title="일정 추가">
            <IconButton
              size="small"
              color="primary"
              onClick={openAdd}
              aria-label="일정 추가"
              sx={{ width: 24, height: 24, p: 0.25 }}
            >
              <AddRoundedIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
        </Stack>
        <Box sx={{ p: 0.65 }}>
          {isLoading ? (
            <Stack alignItems="center" py={1.5}>
              <CircularProgress size={22} />
            </Stack>
          ) : items.length === 0 ? (
            <Stack alignItems="center" py={1.5} spacing={0.25} color="text.secondary">
              <Typography sx={{ fontWeight: 600, fontSize: '0.78rem' }}>등록된 일정이 없습니다</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                + 버튼으로 일정을 추가해 보세요
              </Typography>
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
                gap: 0.6,
              }}
            >
              {items.map((item, index) => (
                <DdayItemCard
                  key={item.id}
                  item={item}
                  color={ddayColorForIndex(index)}
                  onClick={() => openEdit(item)}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      <DdayItemFormDialog
        open={formOpen}
        item={editingItem}
        onClose={closeForm}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        onDelete={editingItem ? handleDelete : undefined}
      />
    </>
  )
}
