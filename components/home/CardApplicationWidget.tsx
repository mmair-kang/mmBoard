'use client'
// 수정: Auto — 2026-07-12 23:36

import { CardApplicationFormDialog } from '@/components/home/CardApplicationFormDialog'
import { CardApplicationItemRow } from '@/components/home/CardApplicationItemRow'
import { sxDesktopTwoColumnGrid } from '@/config/responsiveLayout'
import { type CardApplication, useCardApplications } from '@/hooks/useCardApplications'
import { readApiErrorMessage } from '@/lib/apiResponse'
import type { CardApplicationPayload } from '@/lib/cardApplicationPayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

function replaceItem(prev: CardApplication[] | undefined, updated: CardApplication) {
  return (prev ?? []).map((row) => (row.id === updated.id ? updated : row))
}

export function CardApplicationWidget() {
  const { items, isLoading, mutate } = useCardApplications()
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CardApplication | null>(null)

  const openAdd = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: CardApplication) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: CardApplicationPayload) => {
    const res = await fetch('/api/card-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const created = (await res.json()) as CardApplication
    await mutate((prev) => [created, ...(prev ?? [])], { revalidate: false })
  }

  const handleUpdate = async (payload: CardApplicationPayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/card-applications/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as CardApplication
    await mutate((prev) => replaceItem(prev, updated), { revalidate: false })
  }

  const handleDelete = async () => {
    if (!editingItem) return
    const id = editingItem.id
    await mutate((prev) => (prev ?? []).filter((row) => row.id !== id), { revalidate: false })
    await fetch(`/api/card-applications/${id}`, { method: 'DELETE' })
  }

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          overflow: 'hidden',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: { xs: 1.25, md: 1.5 },
            py: { xs: 1, md: 1.15 },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.15rem' } }}>
            카드 신청
          </Typography>
          <Tooltip title="카드 신청 추가">
            <IconButton size="small" color="primary" onClick={openAdd} aria-label="카드 신청 추가">
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Box sx={{ p: { xs: 1.1, md: 1.35 } }}>
          {isLoading ? (
            <Stack alignItems="center" py={3}>
              <CircularProgress size={28} />
            </Stack>
          ) : items.length === 0 ? (
            <Stack alignItems="center" py={3} spacing={0.5} color="text.secondary">
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>등록된 카드 신청이 없습니다</Typography>
              <Typography variant="caption">+ 버튼으로 혜택 카드를 추가해 보세요</Typography>
            </Stack>
          ) : (
            <Box sx={{ ...sxDesktopTwoColumnGrid, gap: { xs: 1, md: 1.25 } }}>
              {items.map((item) => (
                <CardApplicationItemRow key={item.id} item={item} onEdit={() => openEdit(item)} />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      <CardApplicationFormDialog
        open={formOpen}
        item={editingItem}
        onClose={closeForm}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        onDelete={editingItem ? handleDelete : undefined}
      />
    </>
  )
}
