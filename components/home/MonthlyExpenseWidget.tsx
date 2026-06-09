'use client'
// 수정: Auto — 2026-06-08

import { MonthlyExpenseFormDialog } from '@/components/home/MonthlyExpenseFormDialog'
import { MonthlyExpenseItemRow } from '@/components/home/MonthlyExpenseItemRow'
import { MonthlyExpenseOrderDialog } from '@/components/home/MonthlyExpenseOrderDialog'
import { type MonthlyExpense, useMonthlyExpenses } from '@/hooks/useMonthlyExpenses'
import { useLongPress } from '@/hooks/useLongPress'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { formatWon } from '@/lib/annualPaymentCalc'
import type { MonthlyExpensePayload } from '@/lib/monthlyExpensePayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

function replaceItem(prev: MonthlyExpense[] | undefined, updated: MonthlyExpense) {
  return (prev ?? []).map((row) => (row.id === updated.id ? updated : row))
}

export function MonthlyExpenseWidget() {
  const { items, isLoading, mutate } = useMonthlyExpenses()
  const [formOpen, setFormOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MonthlyExpense | null>(null)

  const monthLabel = dayjs().format('M월')
  const totalAmount = useMemo(() => items.reduce((sum, row) => sum + row.amount, 0), [items])

  const { pointerHandlers: listLongPress, wrapClick: wrapItemClick } = useLongPress({
    onLongPress: () => {
      if (items.length > 0) setOrderOpen(true)
    },
  })

  const openAdd = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: MonthlyExpense) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: MonthlyExpensePayload) => {
    const res = await fetch('/api/monthly-expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const created = (await res.json()) as MonthlyExpense
    await mutate((prev) => [...(prev ?? []), created], { revalidate: false })
    await mutate()
  }

  const handleUpdate = async (payload: MonthlyExpensePayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/monthly-expenses/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as MonthlyExpense
    await mutate((prev) => replaceItem(prev, updated), { revalidate: false })
    await mutate()
  }

  const handleDelete = async () => {
    if (!editingItem) return
    const id = editingItem.id
    await mutate((prev) => (prev ?? []).filter((row) => row.id !== id), { revalidate: false })
    await fetch(`/api/monthly-expenses/${id}`, { method: 'DELETE' })
    await mutate()
  }

  const handleSaveOrder = async (order: number[]) => {
    const res = await fetch('/api/monthly-expenses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '순서 저장에 실패했습니다'))
    const updated = (await res.json()) as MonthlyExpense[]
    await mutate(updated, { revalidate: false })
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
          sx={{ px: 1.25, py: 1.1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Stack direction="row" alignItems="baseline" spacing={0.75}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>한달 고정비</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              {monthLabel}
            </Typography>
          </Stack>
          <Tooltip title="고정비 추가">
            <IconButton size="small" color="primary" onClick={openAdd} aria-label="고정비 추가">
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ px: 1.25, py: 1.1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 1.1,
              py: 0.75,
              borderRadius: 1.75,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              border: 1,
              borderColor: 'primary.light',
              mb: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              월 총 고정비
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: 'primary.main' }}>
              {formatWon(totalAmount)}
            </Typography>
          </Stack>

          {isLoading ? (
            <Stack alignItems="center" py={3}>
              <CircularProgress size={28} />
            </Stack>
          ) : items.length === 0 ? (
            <Stack alignItems="center" py={3} spacing={0.5} color="text.secondary">
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>등록된 고정비가 없습니다</Typography>
              <Typography variant="caption">+ 버튼으로 매달 나가는 비용을 추가해 보세요</Typography>
            </Stack>
          ) : (
            <Stack
              spacing={0.65}
              {...listLongPress}
              sx={{ touchAction: 'pan-y', userSelect: 'none' }}
            >
              {items.map((item) => (
                <MonthlyExpenseItemRow
                  key={item.id}
                  item={item}
                  onEdit={wrapItemClick(() => openEdit(item))}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Paper>

      <MonthlyExpenseFormDialog
        open={formOpen}
        item={editingItem}
        onClose={closeForm}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        onDelete={editingItem ? handleDelete : undefined}
      />

      <MonthlyExpenseOrderDialog
        open={orderOpen}
        items={items}
        onClose={() => setOrderOpen(false)}
        onSave={handleSaveOrder}
      />
    </>
  )
}
