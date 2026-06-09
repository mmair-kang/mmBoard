'use client'
// 수정: Auto — 2026-06-08

import { DividendHoldingsCard } from '@/components/home/DividendHoldingsCard'
import { DividendHoldingsEditDialog } from '@/components/home/DividendHoldingsEditDialog'
import { DividendMonthCard } from '@/components/home/DividendMonthCard'
import {
  DividendMonthFormDialog,
  type DividendMonthFormPayload,
} from '@/components/home/DividendMonthFormDialog'
import { type DividendMonth, useDividends } from '@/hooks/useDividends'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { formatWon } from '@/lib/annualPaymentCalc'
import { MONTHLY_FINANCIAL_INCOME_LIMIT } from '@/lib/dividendCalc'
import type { DividendHoldingPayload } from '@/lib/dividendPayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo, useState } from 'react'

export function DividendWidget() {
  const { holdings, months, yearFinancialIncome, yearLabel, isLoading, mutate } = useDividends()
  const [formOpen, setFormOpen] = useState(false)
  const [holdingsEditOpen, setHoldingsEditOpen] = useState(false)
  const [editingMonth, setEditingMonth] = useState<DividendMonth | null>(null)

  const sortedMonths = useMemo(
    () => [...months].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)),
    [months],
  )

  const existingYearMonths = useMemo(() => months.map((row) => row.yearMonth), [months])

  const openAdd = () => {
    setEditingMonth(null)
    setFormOpen(true)
  }

  const openEdit = (month: DividendMonth) => {
    setEditingMonth(month)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingMonth(null)
  }

  const handleSaveHoldings = async (payload: DividendHoldingPayload[]) => {
    const res = await fetch('/api/dividends', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdings: payload }),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '보유 정보 저장에 실패했습니다'))
    const updated = await res.json()
    await mutate(updated, { revalidate: false })
    await mutate()
  }

  const handleAdd = async (payload: DividendMonthFormPayload) => {
    const res = await fetch('/api/dividends/months', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const updated = await res.json()
    await mutate(updated, { revalidate: false })
    await mutate()
  }

  const handleUpdate = async (payload: DividendMonthFormPayload) => {
    if (!editingMonth) return
    const res = await fetch(`/api/dividends/months/${editingMonth.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: payload.entries }),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = await res.json()
    await mutate(updated, { revalidate: false })
    await mutate()
  }

  const handleDelete = async () => {
    if (!editingMonth) return
    const id = editingMonth.id
    await mutate(
      (prev) =>
        prev
          ? {
              ...prev,
              months: prev.months.filter((row) => row.id !== id),
            }
          : prev,
      { revalidate: false },
    )
    await fetch(`/api/dividends/months/${id}`, { method: 'DELETE' })
    await mutate()
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <>
      <Stack spacing={1.25} sx={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <Paper
          variant="outlined"
          sx={{
            p: 1.15,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            borderColor: 'primary.light',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.35 }}>
            {yearLabel} 연 금융소득 (세전)
          </Typography>
          <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: 'primary.main' }}>
            {formatWon(yearFinancialIncome)}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              mt: 0.35,
              display: 'block',
              lineHeight: 1.45,
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
            }}
          >
            월별 금융소득은 {(MONTHLY_FINANCIAL_INCOME_LIMIT / 10_000).toLocaleString('ko-KR')}만원 이하 유지
          </Typography>
        </Paper>

        <DividendHoldingsCard holdings={holdings} onEdit={() => setHoldingsEditOpen(true)} />

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 0.25 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>월별 배당</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              실제 수령
            </Typography>
          </Stack>
          <Tooltip title="달 추가">
            <IconButton size="small" color="primary" onClick={openAdd} aria-label="달 추가">
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {sortedMonths.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, py: 2, textAlign: 'center' }}>
            등록된 배당 달이 없습니다.
          </Typography>
        ) : (
          sortedMonths.map((month) => (
            <DividendMonthCard key={month.id} month={month} onEdit={() => openEdit(month)} />
          ))
        )}
      </Stack>

      <DividendHoldingsEditDialog
        open={holdingsEditOpen}
        holdings={holdings}
        onClose={() => setHoldingsEditOpen(false)}
        onSubmit={handleSaveHoldings}
      />

      <DividendMonthFormDialog
        open={formOpen}
        month={editingMonth}
        holdings={holdings}
        existingYearMonths={existingYearMonths}
        onClose={closeForm}
        onSubmit={editingMonth ? handleUpdate : handleAdd}
        onDelete={editingMonth ? handleDelete : undefined}
      />
    </>
  )
}
