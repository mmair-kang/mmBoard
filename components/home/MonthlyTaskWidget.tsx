'use client'
// 수정: Auto — 2026-06-08

import { MonthlyTaskFormDialog } from '@/components/home/MonthlyTaskFormDialog'
import { MonthlyTaskItemRow } from '@/components/home/MonthlyTaskItemRow'
import { type MonthlyTask, useMonthlyTasks } from '@/hooks/useMonthlyTasks'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { sortMonthlyTasks } from '@/lib/monthlyTaskMonth'
import type { MonthlyTaskPayload } from '@/lib/monthlyTaskPayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

export function MonthlyTaskWidget() {
  const { items, isLoading, mutate } = useMonthlyTasks()
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MonthlyTask | null>(null)

  const sortedItems = useMemo(() => sortMonthlyTasks(items), [items])
  const monthLabel = dayjs().format('M월')

  const openAdd = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: MonthlyTask) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: MonthlyTaskPayload) => {
    const res = await fetch('/api/monthly-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const created = (await res.json()) as MonthlyTask
    await mutate((prev) => [created, ...(prev ?? [])], { revalidate: false })
    await mutate()
  }

  const handleUpdate = async (payload: MonthlyTaskPayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/monthly-tasks/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as MonthlyTask
    await mutate(
      (prev) => (prev ?? []).map((row) => (row.id === updated.id ? updated : row)),
      { revalidate: false },
    )
    await mutate()
  }

  const handleDelete = async () => {
    if (!editingItem) return
    const id = editingItem.id
    await mutate((prev) => (prev ?? []).filter((row) => row.id !== id), { revalidate: false })
    await fetch(`/api/monthly-tasks/${id}`, { method: 'DELETE' })
    await mutate()
  }

  const handleProgressChange = async (
    item: MonthlyTask,
    patch: { currentAmount?: number; switchOn?: boolean },
  ) => {
    const res = await fetch(`/api/monthly-tasks/${item.id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
    const updated = (await res.json()) as MonthlyTask
    await mutate(
      (prev) => (prev ?? []).map((row) => (row.id === updated.id ? updated : row)),
      { revalidate: false },
    )
    await mutate()
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
          sx={{ px: 1.5, py: 1.25, borderBottom: 1, borderColor: 'divider' }}
        >
          <Stack direction="row" alignItems="baseline" spacing={0.75}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>한달할일</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              {monthLabel}
            </Typography>
          </Stack>
          <Tooltip title="할일 추가">
            <IconButton size="small" color="primary" onClick={openAdd} aria-label="할일 추가">
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Box sx={{ p: 1.5 }}>
          {isLoading ? (
            <Stack alignItems="center" py={3}>
              <CircularProgress size={28} />
            </Stack>
          ) : sortedItems.length === 0 ? (
            <Stack alignItems="center" py={3} spacing={0.5} color="text.secondary">
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>등록된 할일이 없습니다</Typography>
              <Typography variant="caption">+ 버튼으로 이번 달 할일을 추가해 보세요</Typography>
            </Stack>
          ) : (
            <Stack spacing={1}>
              {sortedItems.map((item) => (
                <MonthlyTaskItemRow
                  key={item.id}
                  item={item}
                  onEdit={() => openEdit(item)}
                  onProgressChange={(patch) => handleProgressChange(item, patch)}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Paper>

      <MonthlyTaskFormDialog
        open={formOpen}
        item={editingItem}
        onClose={closeForm}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        onDelete={editingItem ? handleDelete : undefined}
      />
    </>
  )
}
