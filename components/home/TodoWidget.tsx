'use client'
// 수정: Auto — 2026-06-15 (D-1 긴급 색상 강조)

import { TodoFormDialog } from '@/components/home/TodoFormDialog'
import { type TodoItem, useTodos } from '@/hooks/useTodos'
import { readApiErrorMessage } from '@/lib/apiResponse'
import type { TodoItemPayload } from '@/lib/todoPayload'
import {
  calcTodoDueDays,
  formatTodoDday,
  formatTodoDueDateLabel,
  sortTodoItems,
} from '@/lib/todoFormat'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'
import { useState } from 'react'

/** 약 5개 항목 높이 — 이후 세로 스크롤 */
const TODO_LIST_MAX_HEIGHT = 268

type TodoDdayTone = 'imminent' | 'urgent' | 'soon' | 'future'

function todoDdayTone(days: number | null): TodoDdayTone | null {
  if (days == null) return null
  if (days === 1) return 'imminent'
  if (days <= 0) return 'urgent'
  if (days <= 7) return 'soon'
  return 'future'
}

function todoDdayPaletteKey(tone: Exclude<TodoDdayTone, 'imminent' | 'urgent'>): 'warning' | 'info' {
  if (tone === 'soon') return 'warning'
  return 'info'
}

/** D-1 — 내일 마감, 가장 눈에 띄는 코랄 레드 */
function todoDdayImminentColor(theme: Theme): string {
  return theme.palette.mode === 'dark' ? '#ff8f85' : '#c94f42'
}

/** TODAY·D+N — 부드러운 코랄 레드 */
function todoDdayUrgentColor(theme: Theme): string {
  return theme.palette.mode === 'dark' ? '#f0a09a' : '#d97065'
}

function todoDdayColor(theme: Theme, tone: TodoDdayTone): string {
  if (tone === 'imminent') return todoDdayImminentColor(theme)
  if (tone === 'urgent') return todoDdayUrgentColor(theme)
  return theme.palette[todoDdayPaletteKey(tone)].main
}

function todoDdaySurfaceAlpha(tone: TodoDdayTone, theme: Theme, layer: 'box' | 'strip'): number {
  if (tone === 'imminent') {
    if (layer === 'strip') return theme.palette.mode === 'dark' ? 0.32 : 0.2
    return theme.palette.mode === 'dark' ? 0.2 : 0.1
  }
  if (tone === 'urgent') {
    if (layer === 'strip') return theme.palette.mode === 'dark' ? 0.14 : 0.08
    return theme.palette.mode === 'dark' ? 0.1 : 0.045
  }
  if (layer === 'strip') return theme.palette.mode === 'dark' ? 0.14 : 0.08
  return theme.palette.mode === 'dark' ? 0.1 : 0.045
}

function todoDdayBorderAlpha(tone: TodoDdayTone): number {
  if (tone === 'imminent') return 0.58
  if (tone === 'urgent') return 0.32
  return 0.32
}

function todoScheduleBoxSx(tone: TodoDdayTone | null, hasDdayStrip: boolean) {
  return (theme: Theme) => {
    const base = {
      width: 46,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      borderRadius: 0.85,
      border: 1,
      bgcolor: 'background.paper',
      borderColor: theme.palette.divider,
      ...(hasDdayStrip ? { pb: 0 } : { py: 0.28, px: 0.18, textAlign: 'center' as const }),
    }
    if (!tone) return base

    const main = todoDdayColor(theme, tone)
    return {
      ...base,
      borderColor: alpha(main, todoDdayBorderAlpha(tone)),
      bgcolor: alpha(main, todoDdaySurfaceAlpha(tone, theme, 'box')),
      boxShadow:
        tone === 'imminent'
          ? `inset 0 0 0 1px ${alpha(main, 0.22)}`
          : `inset 0 0 0 1px ${alpha(main, 0.08)}`,
    }
  }
}

function TodoListRow({ item, onClick }: { item: TodoItem; onClick: () => void }) {
  const dueDays = calcTodoDueDays(item.dueDate, item.dueTime)
  const dateLabel = formatTodoDueDateLabel(item.dueDate)
  const ddayLabel = formatTodoDday(dueDays)
  const ddayTone = todoDdayTone(dueDays)
  const hasSchedule = Boolean(dateLabel || item.dueTime || ddayLabel)

  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      spacing={0.6}
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
        <Box sx={todoScheduleBoxSx(ddayTone, Boolean(ddayLabel && ddayTone))}>
          <Box
            sx={{
              flex: 1,
              px: 0.18,
              py: ddayLabel && ddayTone ? 0.22 : 0,
              textAlign: 'center',
            }}
          >
            {dateLabel ? (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontWeight: 900,
                  fontSize: '0.62rem',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  color: 'text.primary',
                }}
              >
                {dateLabel}
              </Typography>
            ) : null}
            {item.dueTime ? (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: dateLabel ? 0.05 : 0,
                  fontWeight: 700,
                  fontSize: '0.54rem',
                  lineHeight: 1.15,
                  fontVariantNumeric: 'tabular-nums',
                  color: 'text.secondary',
                }}
              >
                {item.dueTime}
              </Typography>
            ) : null}
          </Box>
          {ddayLabel && ddayTone ? (
            <Box
              sx={(theme) => {
                const main = todoDdayColor(theme, ddayTone)
                return {
                  width: '100%',
                  borderTop: 1,
                  borderColor: alpha(main, todoDdayBorderAlpha(ddayTone)),
                  bgcolor: alpha(main, todoDdaySurfaceAlpha(ddayTone, theme, 'strip')),
                  py: ddayTone === 'imminent' ? 0.16 : 0.12,
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: ddayTone === 'imminent' ? '0.54rem' : '0.52rem',
                  lineHeight: 1,
                  letterSpacing: ddayTone === 'imminent' ? '0.04em' : '0.02em',
                  color: main,
                }
              }}
            >
              {ddayLabel}
            </Box>
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
          whiteSpace: 'pre-line',
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
            <Box
              sx={{
                maxHeight: TODO_LIST_MAX_HEIGHT,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                mx: -0.15,
                px: 0.15,
              }}
            >
              <Stack
                divider={
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 0.5 }} />
                }
              >
                {items.map((item) => (
                  <TodoListRow key={item.id} item={item} onClick={() => openEdit(item)} />
                ))}
              </Stack>
            </Box>
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
