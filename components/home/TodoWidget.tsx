'use client'
// 수정: Auto — 2026-06-11

import { TodoFormDialog } from '@/components/home/TodoFormDialog'
import { type TodoItem, useTodos } from '@/hooks/useTodos'
import { readApiErrorMessage } from '@/lib/apiResponse'
import type { TodoItemPayload } from '@/lib/todoPayload'
import { formatTodoDueDateLabel, sortTodoItems } from '@/lib/todoFormat'
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

function TodoListRow({ item, onClick }: { item: TodoItem; onClick: () => void }) {
  const dateLabel = formatTodoDueDateLabel(item.dueDate)
  const hasSchedule = Boolean(dateLabel || item.dueTime)

  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      spacing={0.65}
      onClick={onClick}
      sx={{
        px: 0.65,
        py: 0.55,
        borderRadius: 1,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.action.hover, 0.06),
        },
      }}
    >
      {hasSchedule ? (
        <Box sx={{ width: 38, flexShrink: 0, textAlign: 'right', pt: 0.05 }}>
          {dateLabel ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', fontWeight: 800, fontSize: '0.62rem', lineHeight: 1.2 }}
            >
              {dateLabel}
            </Typography>
          ) : null}
          {item.dueTime ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', fontWeight: 700, fontSize: '0.58rem', lineHeight: 1.2 }}
            >
              {item.dueTime}
            </Typography>
          ) : null}
        </Box>
      ) : null}
      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          fontWeight: 700,
          fontSize: '0.78rem',
          lineHeight: 1.35,
          wordBreak: 'break-word',
        }}
      >
        {item.content}
      </Typography>
    </Stack>
  )
}

export function TodoWidget() {
  const { items, isLoading, mutate } = useTodos()
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null)

  const openAdd = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: TodoItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: TodoItemPayload) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const created = (await res.json()) as TodoItem
    await mutate((prev) => sortTodoItems([...(prev ?? []), created]), { revalidate: false })
  }

  const handleUpdate = async (payload: TodoItemPayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/todos/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as TodoItem
    await mutate(
      (prev) => sortTodoItems((prev ?? []).map((row) => (row.id === updated.id ? updated : row))),
      { revalidate: false },
    )
  }

  const handleDelete = async () => {
    if (!editingItem) return
    const id = editingItem.id
    await mutate((prev) => (prev ?? []).filter((row) => row.id !== id), { revalidate: false })
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
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
          <Typography sx={{ fontWeight: 900, fontSize: '0.8rem', lineHeight: 1.2 }}>할 일</Typography>
          <Tooltip title="할 일 추가">
            <IconButton
              size="small"
              color="primary"
              onClick={openAdd}
              aria-label="할 일 추가"
              sx={{ width: 24, height: 24, p: 0.25 }}
            >
              <AddRoundedIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ px: 0.35, py: 0.45 }}>
          {isLoading ? (
            <Stack alignItems="center" py={1.5}>
              <CircularProgress size={22} />
            </Stack>
          ) : items.length === 0 ? (
            <Stack alignItems="center" py={1.5} spacing={0.25} color="text.secondary">
              <Typography sx={{ fontWeight: 600, fontSize: '0.78rem' }}>등록된 할 일이 없습니다</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                + 버튼으로 할 일을 추가해 보세요
              </Typography>
            </Stack>
          ) : (
            <Stack
              divider={
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 0.5 }} />
              }
            >
              {items.map((item) => (
                <TodoListRow key={item.id} item={item} onClick={() => openEdit(item)} />
              ))}
            </Stack>
          )}
        </Box>
      </Paper>

      <TodoFormDialog
        open={formOpen}
        item={editingItem}
        onClose={closeForm}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        onDelete={editingItem ? handleDelete : undefined}
      />
    </>
  )
}
