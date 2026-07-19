'use client'
// 수정: Auto — 2026-07-19 16:15 (결제 카드)
// 수정: Auto — 2026-07-19 13:10 (보금자리론 상세)
// 수정: Auto — 2026-07-19 13:00 (렌탈 계약정보)
// 수정: Auto — 2026-07-19 03:40 (보험 계약상세)
// 수정: Auto — 2026-07-19 03:30 (국민연금 고지서 정보·수정)
// 수정: Auto — 2026-07-19 03:15 (건보 고지서 정보·수정)
// 수정: Auto — 2026-07-19 03:25 (국민연금·건보 상세)
// 수정: Auto — 2026-07-19 03:15 (통신비 정보·수정)

import { MonthlyBogeumjariEditorDialog } from '@/components/home/MonthlyBogeumjariEditorDialog'
import { MonthlyBogeumjariViewDialog } from '@/components/home/MonthlyBogeumjariViewDialog'
import { MonthlyExpenseFormDialog } from '@/components/home/MonthlyExpenseFormDialog'
import { MonthlyExpenseItemRow } from '@/components/home/MonthlyExpenseItemRow'
import { MonthlyExpenseOrderDialog } from '@/components/home/MonthlyExpenseOrderDialog'
import { MonthlyHealthInsuranceEditorDialog } from '@/components/home/MonthlyHealthInsuranceEditorDialog'
import { MonthlyHealthInsuranceViewDialog } from '@/components/home/MonthlyHealthInsuranceViewDialog'
import { MonthlyInsuranceEditorDialog } from '@/components/home/MonthlyInsuranceEditorDialog'
import { MonthlyInsuranceViewDialog } from '@/components/home/MonthlyInsuranceViewDialog'
import { MonthlyNationalPensionEditorDialog } from '@/components/home/MonthlyNationalPensionEditorDialog'
import { MonthlyNationalPensionViewDialog } from '@/components/home/MonthlyNationalPensionViewDialog'
import { MonthlyRentalEditorDialog } from '@/components/home/MonthlyRentalEditorDialog'
import { MonthlyRentalViewDialog } from '@/components/home/MonthlyRentalViewDialog'
import { MonthlyTelecomDetailEditorDialog } from '@/components/home/MonthlyTelecomDetailEditorDialog'
import { MonthlyTelecomDetailViewDialog } from '@/components/home/MonthlyTelecomDetailViewDialog'
import { type MonthlyExpense, useMonthlyExpenses } from '@/hooks/useMonthlyExpenses'
import { useLongPress } from '@/hooks/useLongPress'
import { useMonthlyTasks } from '@/hooks/useMonthlyTasks'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  bogeumjariGrandTotal,
  type BogeumjariDetail,
} from '@/lib/bogeumjariExpenseDetail'
import {
  healthInsuranceGrandTotal,
  type HealthInsuranceDetail,
} from '@/lib/healthInsuranceDetail'
import {
  insuranceGrandTotal,
  type InsuranceDetail,
} from '@/lib/insuranceExpenseDetail'
import type { MonthlyExpensePayload } from '@/lib/monthlyExpensePayload'
import {
  nationalPensionGrandTotal,
  type NationalPensionDetail,
} from '@/lib/nationalPensionDetail'
import { rentalGrandTotal, type RentalDetail } from '@/lib/rentalExpenseDetail'
import {
  hasSectionExpenseDetailType,
  telecomGrandTotal,
  type TelecomDetail,
} from '@/lib/telecomExpenseDetail'
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
  const { items: monthlyTasks } = useMonthlyTasks()
  const [formOpen, setFormOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MonthlyExpense | null>(null)
  const [infoItem, setInfoItem] = useState<MonthlyExpense | null>(null)
  const [infoEditOpen, setInfoEditOpen] = useState(false)

  const monthLabel = dayjs().format('M월')
  const totalAmount = useMemo(() => items.reduce((sum, row) => sum + row.amount, 0), [items])
  const cardTitleById = useMemo(() => {
    const map = new Map<number, string>()
    for (const task of monthlyTasks) {
      if (task.optionType === 'card_target' || task.optionType === 'card_benefit') {
        map.set(task.id, task.title)
      }
    }
    return map
  }, [monthlyTasks])

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
  }

  const handleDelete = async () => {
    if (!editingItem) return
    const id = editingItem.id
    await mutate((prev) => (prev ?? []).filter((row) => row.id !== id), { revalidate: false })
    await fetch(`/api/monthly-expenses/${id}`, { method: 'DELETE' })
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
  }

  const handleSaveTelecomFromInfo = async (detail: TelecomDetail) => {
    if (!infoItem || !hasSectionExpenseDetailType(infoItem.expenseType)) return
    const amount = telecomGrandTotal(detail)
    const payload: MonthlyExpensePayload = {
      title: infoItem.title,
      dayOfMonth: infoItem.dayOfMonth,
      amount,
      payType: infoItem.payType,
      monthlyTaskId: infoItem.payType === 'card' ? infoItem.monthlyTaskId : null,
      expenseType: infoItem.expenseType,
      telecomDetail: detail,
      healthInsuranceDetail: null,
      nationalPensionDetail: null,
      insuranceDetail: null,
      rentalDetail: null,
      bogeumjariDetail: null,
    }
    const res = await fetch(`/api/monthly-expenses/${infoItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as MonthlyExpense
    await mutate((prev) => replaceItem(prev, updated), { revalidate: false })
    setInfoItem(updated)
    setInfoEditOpen(false)
  }

  const handleSaveHealthFromInfo = async (detail: HealthInsuranceDetail) => {
    if (!infoItem || infoItem.expenseType !== 'healthInsurance') return
    const amount = healthInsuranceGrandTotal(detail)
    const payload: MonthlyExpensePayload = {
      title: infoItem.title,
      dayOfMonth: infoItem.dayOfMonth,
      amount,
      payType: infoItem.payType,
      monthlyTaskId: infoItem.payType === 'card' ? infoItem.monthlyTaskId : null,
      expenseType: 'healthInsurance',
      telecomDetail: null,
      healthInsuranceDetail: detail,
      nationalPensionDetail: null,
      insuranceDetail: null,
      rentalDetail: null,
      bogeumjariDetail: null,
    }
    const res = await fetch(`/api/monthly-expenses/${infoItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as MonthlyExpense
    await mutate((prev) => replaceItem(prev, updated), { revalidate: false })
    setInfoItem(updated)
    setInfoEditOpen(false)
  }

  const handleSavePensionFromInfo = async (detail: NationalPensionDetail) => {
    if (!infoItem || infoItem.expenseType !== 'nationalPension') return
    const amount = nationalPensionGrandTotal(detail)
    const payload: MonthlyExpensePayload = {
      title: infoItem.title,
      dayOfMonth: infoItem.dayOfMonth,
      amount,
      payType: infoItem.payType,
      monthlyTaskId: infoItem.payType === 'card' ? infoItem.monthlyTaskId : null,
      expenseType: 'nationalPension',
      telecomDetail: null,
      healthInsuranceDetail: null,
      nationalPensionDetail: detail,
      insuranceDetail: null,
      rentalDetail: null,
      bogeumjariDetail: null,
    }
    const res = await fetch(`/api/monthly-expenses/${infoItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as MonthlyExpense
    await mutate((prev) => replaceItem(prev, updated), { revalidate: false })
    setInfoItem(updated)
    setInfoEditOpen(false)
  }

  const handleSaveInsuranceFromInfo = async (detail: InsuranceDetail) => {
    if (!infoItem || infoItem.expenseType !== 'insurance') return
    const amount = insuranceGrandTotal(detail)
    const payload: MonthlyExpensePayload = {
      title: infoItem.title,
      dayOfMonth: infoItem.dayOfMonth,
      amount,
      payType: infoItem.payType,
      monthlyTaskId: infoItem.payType === 'card' ? infoItem.monthlyTaskId : null,
      expenseType: 'insurance',
      telecomDetail: null,
      healthInsuranceDetail: null,
      nationalPensionDetail: null,
      insuranceDetail: detail,
      rentalDetail: null,
      bogeumjariDetail: null,
    }
    const res = await fetch(`/api/monthly-expenses/${infoItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as MonthlyExpense
    await mutate((prev) => replaceItem(prev, updated), { revalidate: false })
    setInfoItem(updated)
    setInfoEditOpen(false)
  }

  const handleSaveRentalFromInfo = async (detail: RentalDetail) => {
    if (!infoItem || infoItem.expenseType !== 'rental') return
    const amount = rentalGrandTotal(detail)
    const payload: MonthlyExpensePayload = {
      title: infoItem.title,
      dayOfMonth: infoItem.dayOfMonth,
      amount,
      payType: infoItem.payType,
      monthlyTaskId: infoItem.payType === 'card' ? infoItem.monthlyTaskId : null,
      expenseType: 'rental',
      telecomDetail: null,
      healthInsuranceDetail: null,
      nationalPensionDetail: null,
      insuranceDetail: null,
      rentalDetail: detail,
      bogeumjariDetail: null,
    }
    const res = await fetch(`/api/monthly-expenses/${infoItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as MonthlyExpense
    await mutate((prev) => replaceItem(prev, updated), { revalidate: false })
    setInfoItem(updated)
    setInfoEditOpen(false)
  }

  const handleSaveBogeumjariFromInfo = async (detail: BogeumjariDetail) => {
    if (!infoItem || infoItem.expenseType !== 'bogeumjari') return
    const amount = bogeumjariGrandTotal(detail)
    const payload: MonthlyExpensePayload = {
      title: infoItem.title,
      dayOfMonth: detail.paymentDay,
      amount,
      payType: infoItem.payType,
      monthlyTaskId: infoItem.payType === 'card' ? infoItem.monthlyTaskId : null,
      expenseType: 'bogeumjari',
      telecomDetail: null,
      healthInsuranceDetail: null,
      nationalPensionDetail: null,
      insuranceDetail: null,
      rentalDetail: null,
      bogeumjariDetail: detail,
    }
    const res = await fetch(`/api/monthly-expenses/${infoItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as MonthlyExpense
    await mutate((prev) => replaceItem(prev, updated), { revalidate: false })
    setInfoItem(updated)
    setInfoEditOpen(false)
  }

  const isTelecomInfo = infoItem != null && hasSectionExpenseDetailType(infoItem.expenseType)
  const isHealthInfo = infoItem?.expenseType === 'healthInsurance'
  const isPensionInfo = infoItem?.expenseType === 'nationalPension'
  const isInsuranceInfo = infoItem?.expenseType === 'insurance'
  const isRentalInfo = infoItem?.expenseType === 'rental'
  const isBogeumjariInfo = infoItem?.expenseType === 'bogeumjari'
  const infoCardTitle =
    infoItem?.payType === 'card' && infoItem.monthlyTaskId != null
      ? (cardTitleById.get(infoItem.monthlyTaskId) ?? null)
      : null
  const infoPayType = infoItem?.payType ?? 'card'

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
                  onOpenDetailInfo={() => setInfoItem(item)}
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

      <MonthlyTelecomDetailViewDialog
        open={isTelecomInfo && !infoEditOpen}
        title={infoItem?.title ?? ''}
        expenseType="telecom"
        detail={infoItem?.telecomDetail ?? null}
        payType={infoPayType}
        cardTitle={infoCardTitle}
        onClose={() => setInfoItem(null)}
        onEdit={() => setInfoEditOpen(true)}
      />

      <MonthlyTelecomDetailEditorDialog
        open={infoEditOpen && isTelecomInfo}
        expenseType="telecom"
        initial={infoItem?.telecomDetail ?? null}
        expenseTitle={infoItem?.title}
        onClose={() => setInfoEditOpen(false)}
        onSave={(detail) => {
          void handleSaveTelecomFromInfo(detail)
        }}
      />

      <MonthlyHealthInsuranceViewDialog
        open={Boolean(isHealthInfo && !infoEditOpen)}
        title={infoItem?.title ?? ''}
        detail={infoItem?.healthInsuranceDetail ?? null}
        payType={infoPayType}
        cardTitle={infoCardTitle}
        onClose={() => setInfoItem(null)}
        onEdit={() => setInfoEditOpen(true)}
      />

      <MonthlyHealthInsuranceEditorDialog
        open={Boolean(infoEditOpen && isHealthInfo)}
        initial={infoItem?.healthInsuranceDetail ?? null}
        expenseTitle={infoItem?.title}
        onClose={() => setInfoEditOpen(false)}
        onSave={(detail) => {
          void handleSaveHealthFromInfo(detail)
        }}
      />

      <MonthlyNationalPensionViewDialog
        open={Boolean(isPensionInfo && !infoEditOpen)}
        title={infoItem?.title ?? ''}
        detail={infoItem?.nationalPensionDetail ?? null}
        payType={infoPayType}
        cardTitle={infoCardTitle}
        onClose={() => setInfoItem(null)}
        onEdit={() => setInfoEditOpen(true)}
      />

      <MonthlyNationalPensionEditorDialog
        open={Boolean(infoEditOpen && isPensionInfo)}
        initial={infoItem?.nationalPensionDetail ?? null}
        expenseTitle={infoItem?.title}
        onClose={() => setInfoEditOpen(false)}
        onSave={(detail) => {
          void handleSavePensionFromInfo(detail)
        }}
      />

      <MonthlyInsuranceViewDialog
        open={Boolean(isInsuranceInfo && !infoEditOpen)}
        title={infoItem?.title ?? ''}
        detail={infoItem?.insuranceDetail ?? null}
        payType={infoPayType}
        cardTitle={infoCardTitle}
        onClose={() => setInfoItem(null)}
        onEdit={() => setInfoEditOpen(true)}
      />

      <MonthlyInsuranceEditorDialog
        open={Boolean(infoEditOpen && isInsuranceInfo)}
        initial={infoItem?.insuranceDetail ?? null}
        expenseTitle={infoItem?.title}
        onClose={() => setInfoEditOpen(false)}
        onSave={(detail) => {
          void handleSaveInsuranceFromInfo(detail)
        }}
      />

      <MonthlyRentalViewDialog
        open={Boolean(isRentalInfo && !infoEditOpen)}
        title={infoItem?.title ?? ''}
        detail={infoItem?.rentalDetail ?? null}
        payType={infoPayType}
        cardTitle={infoCardTitle}
        onClose={() => setInfoItem(null)}
        onEdit={() => setInfoEditOpen(true)}
      />

      <MonthlyRentalEditorDialog
        open={Boolean(infoEditOpen && isRentalInfo)}
        initial={infoItem?.rentalDetail ?? null}
        expenseTitle={infoItem?.title}
        onClose={() => setInfoEditOpen(false)}
        onSave={(detail) => {
          void handleSaveRentalFromInfo(detail)
        }}
      />

      <MonthlyBogeumjariViewDialog
        open={Boolean(isBogeumjariInfo && !infoEditOpen)}
        title={infoItem?.title ?? ''}
        detail={infoItem?.bogeumjariDetail ?? null}
        payType={infoPayType}
        cardTitle={infoCardTitle}
        onClose={() => setInfoItem(null)}
        onEdit={() => setInfoEditOpen(true)}
      />

      <MonthlyBogeumjariEditorDialog
        open={Boolean(infoEditOpen && isBogeumjariInfo)}
        initial={infoItem?.bogeumjariDetail ?? null}
        expenseTitle={infoItem?.title}
        onClose={() => setInfoEditOpen(false)}
        onSave={(detail) => {
          void handleSaveBogeumjariFromInfo(detail)
        }}
      />
    </>
  )
}
