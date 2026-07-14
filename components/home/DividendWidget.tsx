'use client'
// 수정: Auto — 2026-07-15 01:05 (예상 연 금융소득 라벨)
// 수정: Auto — 2026-07-15 00:58 (연도 전환·카드 헤더)
// 수정: Auto — 2026-07-14 23:37 (KODEX 과세표준)
// 수정: Auto — 2026-07-14 23:24 (보유 배당주 라벨)
// 수정: Auto — 2026-07-14 01:33 (투자 연동 환율)
// 수정: Auto — 2026-06-08 (금융소득 요약 통합)

import { DividendHoldingsCard } from '@/components/home/DividendHoldingsCard'
import { DividendHoldingsEditDialog } from '@/components/home/DividendHoldingsEditDialog'
import { DividendMonthCard } from '@/components/home/DividendMonthCard'
import {
  DividendMonthFormDialog,
  type DividendMonthFormPayload,
} from '@/components/home/DividendMonthFormDialog'
import { type DividendMonth, useDividends } from '@/hooks/useDividends'
import { useInvestments } from '@/hooks/useInvestments'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { formatWon } from '@/lib/annualPaymentCalc'
import { MONTHLY_FINANCIAL_INCOME_LIMIT } from '@/lib/dividendCalc'
import type { DividendHoldingPayload } from '@/lib/dividendPayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
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

export function DividendWidget() {
  const { holdings, months, yearFinancialIncome, yearLabel, isLoading, mutate } = useDividends()
  const { usdKrwRate } = useInvestments()
  const [formOpen, setFormOpen] = useState(false)
  const [holdingsEditOpen, setHoldingsEditOpen] = useState(false)
  const [editingMonth, setEditingMonth] = useState<DividendMonth | null>(null)
  const [viewYear, setViewYear] = useState(() => Number(dayjs().format('YYYY')))

  const yearBounds = useMemo(() => {
    const current = Number(dayjs().format('YYYY'))
    let minYear = current - 5
    let maxYear = current
    for (const month of months) {
      const y = Number(month.yearMonth.slice(0, 4))
      if (Number.isFinite(y)) {
        if (y < minYear) minYear = y
        if (y > maxYear) maxYear = y
      }
    }
    return { minYear, maxYear }
  }, [months])

  const sortedMonths = useMemo(
    () =>
      [...months]
        .filter((row) => row.yearMonth.startsWith(`${viewYear}-`))
        .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)),
    [months, viewYear],
  )

  const existingYearMonths = useMemo(() => months.map((row) => row.yearMonth), [months])

  const holdingsYearEstimate = useMemo(() => {
    let income = 0
    let hasIncome = false
    for (const row of holdings) {
      const value = row.taxableKrw ?? row.grossKrw
      if (value != null) {
        income += value
        hasIncome = true
      }
    }
    return hasIncome ? income * 12 : null
  }, [holdings])

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
    const addedYear = Number(payload.yearMonth.slice(0, 4))
    if (Number.isFinite(addedYear)) setViewYear(addedYear)
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
            px: 1,
            py: 0.85,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" divider={<Box sx={{ width: '1px', bgcolor: 'divider', alignSelf: 'stretch', mx: 0.5 }} />}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.3 }}>
                {yearLabel} 현재 금융소득
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: 'primary.main', lineHeight: 1.35, mt: 0.15 }}>
                {formatWon(yearFinancialIncome)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.3 }}>
                보유 배당주 예상 연 금융소득
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: 'secondary.dark', lineHeight: 1.35, mt: 0.15 }}>
                {holdingsYearEstimate != null ? formatWon(holdingsYearEstimate) : '—'}
              </Typography>
            </Box>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, mt: 0.5, display: 'block', lineHeight: 1.35, fontSize: '0.68rem' }}
          >
            세전 · 월별 {(MONTHLY_FINANCIAL_INCOME_LIMIT / 10_000).toLocaleString('ko-KR')}만원 이하 유지
          </Typography>
        </Paper>

        <DividendHoldingsCard holdings={holdings} onEdit={() => setHoldingsEditOpen(true)} />

        <Stack direction="row" alignItems="center" sx={{ pt: 0.25, minHeight: 36 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', flex: 1, minWidth: 0 }}>월별 배당</Typography>
          <Stack direction="row" alignItems="center" spacing={0.15} sx={{ flexShrink: 0 }}>
            <IconButton
              size="small"
              aria-label="이전 연도"
              disabled={viewYear <= yearBounds.minYear}
              onClick={() => setViewYear((y) => y - 1)}
              sx={{ p: 0.35 }}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '0.92rem',
                minWidth: 48,
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              {viewYear}
            </Typography>
            <IconButton
              size="small"
              aria-label="다음 연도"
              disabled={viewYear >= yearBounds.maxYear}
              onClick={() => setViewYear((y) => y + 1)}
              sx={{ p: 0.35 }}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', minWidth: 0 }}>
            <Tooltip title="달 추가">
              <IconButton size="small" color="primary" onClick={openAdd} aria-label="달 추가">
                <AddRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>

        {sortedMonths.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, py: 2, textAlign: 'center' }}>
            {viewYear}년 등록된 배당 달이 없습니다.
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
        usdKrwRate={usdKrwRate}
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
