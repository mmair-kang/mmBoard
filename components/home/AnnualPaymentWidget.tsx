'use client'
// 수정: Auto — 2026-07-19 17:56 (연납 초록 테마)
// 수정: Auto — 2026-07-19 17:40 (연 총 고정비 초록·남은금액 회색)
// 수정: Auto — 2026-07-19 16:10 (목록 칩 단순화)
// 수정: Auto — 2026-07-19 16:05 (결제방식·카드 표시)
// 수정: Auto — 2026-07-19 16:00 (네이버플러스 멤버십)
// 수정: Auto — 2026-07-19 15:10 (Cursor PRO)
// 수정: Auto — 2026-07-19 14:50 (목록 클릭 개별 관리)
// 수정: Auto — 2026-07-19 14:40 (연납 자동차보험 ⓘ)
// 수정: Auto — 2026-06-08

import { AnnualCarInsuranceEditorDialog } from '@/components/home/AnnualCarInsuranceEditorDialog'
import { AnnualCarInsuranceViewDialog } from '@/components/home/AnnualCarInsuranceViewDialog'
import { AnnualCursorProEditorDialog } from '@/components/home/AnnualCursorProEditorDialog'
import { AnnualCursorProViewDialog } from '@/components/home/AnnualCursorProViewDialog'
import { AnnualNaverPlusEditorDialog } from '@/components/home/AnnualNaverPlusEditorDialog'
import { AnnualNaverPlusViewDialog } from '@/components/home/AnnualNaverPlusViewDialog'
import { AnnualPaymentFormDialog } from '@/components/home/AnnualPaymentFormDialog'
import { type AnnualPayment, useAnnualPayments } from '@/hooks/useAnnualPayments'
import { useMonthlyTasks } from '@/hooks/useMonthlyTasks'
import { calcAnnualPaymentSummary, formatWon } from '@/lib/annualPaymentCalc'
import { formatAnnualDueLabel } from '@/lib/annualPaymentLabel'
import type { AnnualPaymentPayload } from '@/lib/annualPaymentPayload'
import { getAnnualPaymentPayTypeLabel } from '@/lib/annualPaymentTypes'
import { readApiErrorMessage } from '@/lib/apiResponse'
import {
  carInsuranceAnnualGrandTotal,
  type CarInsuranceAnnualDetail,
} from '@/lib/carInsuranceAnnualDetail'
import {
  cursorProAnnualGrandTotal,
  type CursorProAnnualDetail,
} from '@/lib/cursorProAnnualDetail'
import {
  naverPlusAnnualGrandTotal,
  type NaverPlusAnnualDetail,
} from '@/lib/naverPlusAnnualDetail'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

/** 연납 초록 테마 (파랑 primary 대신) */
const ANNUAL_GREEN = '#0f766e'
const ANNUAL_GREEN_LIGHT = '#14b8a6'

function annualGreen(theme: Theme) {
  return theme.palette.mode === 'dark' ? ANNUAL_GREEN_LIGHT : ANNUAL_GREEN
}

function replacePayment(prev: AnnualPayment[] | undefined, updated: AnnualPayment) {
  return (prev ?? []).map((row) => (row.id === updated.id ? updated : row))
}

function scheduleFromLastPaid(lastPaidOn: string): { month: number; dayOfMonth: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(lastPaidOn)
  if (!match) return null
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { month, dayOfMonth: day }
}

function hasDetailInfo(payment: AnnualPayment): boolean {
  if (payment.paymentType === 'carInsurance') return payment.carInsuranceDetail != null
  if (payment.paymentType === 'cursorPro') return payment.cursorProDetail != null
  if (payment.paymentType === 'naverPlus') return payment.naverPlusDetail != null
  return false
}

function PaymentRow({
  payment,
  saving,
  onEdit,
  onSwitchChange,
  onOpenDetailInfo,
}: {
  payment: AnnualPayment
  saving: boolean
  onEdit: () => void
  onSwitchChange: (switchOn: boolean) => Promise<void>
  onOpenDetailInfo?: () => void
}) {
  const showInfo = hasDetailInfo(payment)
  const payLabel = getAnnualPaymentPayTypeLabel(payment.payType ?? 'card')

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit()
        }
      }}
      sx={{
        px: 1,
        py: 0.55,
        borderRadius: 1.5,
        cursor: 'pointer',
        bgcolor: (theme) =>
          payment.switchOn
            ? alpha(theme.palette.success.main, 0.08)
            : alpha(theme.palette.action.hover, 0.04),
        border: 1,
        borderColor: payment.switchOn ? 'success.light' : 'divider',
        '&:active': { opacity: 0.85 },
      }}
    >
      <Chip
        size="small"
        label={`${payment.month}월`}
        sx={{
          height: 22,
          fontWeight: 800,
          fontSize: '0.68rem',
          flexShrink: 0,
          borderColor: (theme) => annualGreen(theme),
          color: (theme) => annualGreen(theme),
          bgcolor: (theme) => alpha(annualGreen(theme), 0.1),
        }}
        variant="outlined"
      />
      <Stack direction="row" alignItems="center" spacing={0.15} sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            minWidth: 0,
            fontWeight: 700,
            fontSize: '0.84rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {payment.title}
        </Typography>
        {showInfo ? (
          <IconButton
            size="small"
            aria-label="상세 보기"
            onClick={(e) => {
              e.stopPropagation()
              onOpenDetailInfo?.()
            }}
            sx={{ color: 'text.secondary', p: 0.25, flexShrink: 0 }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        ) : null}
      </Stack>
      <Chip
        size="small"
        label={payLabel}
        color={payment.payType === 'cash' ? 'secondary' : 'primary'}
        sx={{
          height: 22,
          fontWeight: 800,
          fontSize: '0.62rem',
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'text.secondary', flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        {formatWon(payment.amount)}
      </Typography>
      <Switch
        size="small"
        checked={payment.switchOn}
        onClick={(e) => e.stopPropagation()}
        onChange={(_, checked) => void onSwitchChange(checked)}
        disabled={saving}
        color={payment.switchOn ? 'success' : 'default'}
        sx={{ flexShrink: 0 }}
      />
    </Stack>
  )
}

export function AnnualPaymentWidget() {
  const { payments, isLoading, mutate } = useAnnualPayments()
  const { items: monthlyTasks } = useMonthlyTasks()
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AnnualPayment | null>(null)
  const [infoItem, setInfoItem] = useState<AnnualPayment | null>(null)
  const [infoEditOpen, setInfoEditOpen] = useState(false)

  const yearLabel = dayjs().format('YYYY년')

  const cardTitleById = useMemo(() => {
    const map = new Map<number, string>()
    for (const task of monthlyTasks) {
      if (task.optionType === 'card_target' || task.optionType === 'card_benefit') {
        map.set(task.id, task.title)
      }
    }
    return map
  }, [monthlyTasks])

  const summary = useMemo(() => calcAnnualPaymentSummary(payments), [payments])
  const allPaid = summary.totalAmount > 0 && summary.remainingAmount === 0

  const openAdd = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEdit = (payment: AnnualPayment) => {
    setEditingItem(payment)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: AnnualPaymentPayload) => {
    const res = await fetch('/api/annual-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const created = (await res.json()) as AnnualPayment
    await mutate((prev) => [...(prev ?? []), created], { revalidate: false })
  }

  const handleUpdate = async (payload: AnnualPaymentPayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/annual-payments/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as AnnualPayment
    await mutate((prev) => replacePayment(prev, updated), { revalidate: false })
  }

  const handleDelete = async () => {
    if (!editingItem) return
    const id = editingItem.id
    await mutate((prev) => (prev ?? []).filter((row) => row.id !== id), { revalidate: false })
    await fetch(`/api/annual-payments/${id}`, { method: 'DELETE' })
  }

  const handleSwitch = async (paymentId: number, switchOn: boolean) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/annual-payments/${paymentId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ switchOn }),
      })
      if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
      const updated = (await res.json()) as AnnualPayment[]
      await mutate(updated, { revalidate: false })
    } finally {
      setSaving(false)
    }
  }

  const payFieldsFromInfo = () => ({
    payType: infoItem?.payType ?? ('card' as const),
    monthlyTaskId: infoItem?.payType === 'cash' ? null : (infoItem?.monthlyTaskId ?? null),
  })

  const handleSaveCarFromInfo = async (detail: CarInsuranceAnnualDetail) => {
    if (!infoItem || infoItem.paymentType !== 'carInsurance') return
    const amount = carInsuranceAnnualGrandTotal(detail)
    const payload: AnnualPaymentPayload = {
      title: infoItem.title,
      month: infoItem.month,
      dayOfMonth: infoItem.dayOfMonth,
      amount,
      paymentType: 'carInsurance',
      ...payFieldsFromInfo(),
      carInsuranceDetail: detail,
      cursorProDetail: null,
      naverPlusDetail: null,
    }
    const res = await fetch(`/api/annual-payments/${infoItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as AnnualPayment
    await mutate((prev) => replacePayment(prev, updated), { revalidate: false })
    setInfoItem(updated)
    setInfoEditOpen(false)
  }

  const handleSaveCursorFromInfo = async (detail: CursorProAnnualDetail) => {
    if (!infoItem || infoItem.paymentType !== 'cursorPro') return
    const amount = cursorProAnnualGrandTotal(detail)
    let month = infoItem.month
    let dayOfMonth = infoItem.dayOfMonth
    const schedule = scheduleFromLastPaid(detail.lastPaidOn)
    if (schedule) {
      month = schedule.month
      dayOfMonth = schedule.dayOfMonth
    }
    const payload: AnnualPaymentPayload = {
      title: infoItem.title,
      month,
      dayOfMonth,
      amount,
      paymentType: 'cursorPro',
      ...payFieldsFromInfo(),
      carInsuranceDetail: null,
      cursorProDetail: detail,
      naverPlusDetail: null,
    }
    const res = await fetch(`/api/annual-payments/${infoItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as AnnualPayment
    await mutate((prev) => replacePayment(prev, updated), { revalidate: false })
    setInfoItem(updated)
    setInfoEditOpen(false)
  }

  const handleSaveNaverFromInfo = async (detail: NaverPlusAnnualDetail) => {
    if (!infoItem || infoItem.paymentType !== 'naverPlus') return
    const amount = naverPlusAnnualGrandTotal(detail)
    let month = infoItem.month
    let dayOfMonth = infoItem.dayOfMonth
    const schedule = scheduleFromLastPaid(detail.lastPaidOn)
    if (schedule) {
      month = schedule.month
      dayOfMonth = schedule.dayOfMonth
    }
    const payload: AnnualPaymentPayload = {
      title: infoItem.title,
      month,
      dayOfMonth,
      amount,
      paymentType: 'naverPlus',
      ...payFieldsFromInfo(),
      carInsuranceDetail: null,
      cursorProDetail: null,
      naverPlusDetail: detail,
    }
    const res = await fetch(`/api/annual-payments/${infoItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as AnnualPayment
    await mutate((prev) => replacePayment(prev, updated), { revalidate: false })
    setInfoItem(updated)
    setInfoEditOpen(false)
  }

  const isCarInfo = infoItem?.paymentType === 'carInsurance'
  const isCursorInfo = infoItem?.paymentType === 'cursorPro'
  const isNaverInfo = infoItem?.paymentType === 'naverPlus'
  const infoCardTitle =
    infoItem?.payType === 'card' && infoItem.monthlyTaskId != null
      ? (cardTitleById.get(infoItem.monthlyTaskId) ?? null)
      : null
  const infoDueLabel = infoItem
    ? formatAnnualDueLabel(infoItem.month, infoItem.dayOfMonth)
    : ''
  const infoPayType = infoItem?.payType ?? 'card'

  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 3 }}>
        <Stack alignItems="center">
          <CircularProgress size={28} />
        </Stack>
      </Paper>
    )
  }

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          overflow: 'hidden',
          borderColor: allPaid ? 'success.main' : 'divider',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ px: 1.25, py: 1.1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', flex: 1 }}>연납</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {yearLabel}
          </Typography>
          <Tooltip title="연납 추가">
            <IconButton
              size="small"
              onClick={openAdd}
              aria-label="연납 추가"
              sx={{ color: (theme) => annualGreen(theme) }}
            >
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
              bgcolor: (theme) => alpha(annualGreen(theme), 0.1),
              border: 1,
              borderColor: (theme) => alpha(annualGreen(theme), 0.35),
              mb: 0.75,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              연 총 고정비
            </Typography>
            <Typography
              sx={{ fontWeight: 900, fontSize: '1rem', color: (theme) => annualGreen(theme) }}
            >
              {formatWon(summary.totalAmount)}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 1.1,
              py: 0.65,
              borderRadius: 1.75,
              bgcolor: (theme) => alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.12 : 0.06),
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              남은 금액
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: 'text.secondary' }}>
              {allPaid ? '완납' : formatWon(summary.remainingAmount)}
            </Typography>
          </Stack>
        </Box>

        {payments.length > 0 ? (
          <Stack spacing={0.75} sx={{ px: 1.25, pb: 1.25 }}>
            {payments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                saving={saving}
                onEdit={() => openEdit(payment)}
                onSwitchChange={(switchOn) => handleSwitch(payment.id, switchOn)}
                onOpenDetailInfo={() => setInfoItem(payment)}
              />
            ))}
          </Stack>
        ) : (
          <Stack alignItems="center" py={2.5} px={1.5} color="text.secondary">
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>등록된 연납이 없습니다</Typography>
            <Typography variant="caption">+ 버튼으로 올해 납부 항목을 추가해 보세요</Typography>
          </Stack>
        )}
      </Paper>

      <AnnualPaymentFormDialog
        open={formOpen}
        item={editingItem}
        onClose={closeForm}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        onDelete={editingItem ? handleDelete : undefined}
      />

      <AnnualCarInsuranceViewDialog
        open={Boolean(isCarInfo && !infoEditOpen)}
        title={infoItem?.title ?? ''}
        detail={infoItem?.carInsuranceDetail ?? null}
        dueLabel={infoDueLabel}
        payType={infoPayType}
        cardTitle={infoCardTitle}
        onClose={() => setInfoItem(null)}
        onEdit={() => setInfoEditOpen(true)}
      />

      <AnnualCarInsuranceEditorDialog
        open={Boolean(infoEditOpen && isCarInfo)}
        initial={infoItem?.carInsuranceDetail ?? null}
        paymentTitle={infoItem?.title}
        onClose={() => setInfoEditOpen(false)}
        onSave={(detail) => {
          void handleSaveCarFromInfo(detail)
        }}
      />

      <AnnualCursorProViewDialog
        open={Boolean(isCursorInfo && !infoEditOpen)}
        title={infoItem?.title ?? ''}
        detail={infoItem?.cursorProDetail ?? null}
        dueLabel={infoDueLabel}
        payType={infoPayType}
        cardTitle={infoCardTitle}
        onClose={() => setInfoItem(null)}
        onEdit={() => setInfoEditOpen(true)}
      />

      <AnnualCursorProEditorDialog
        open={Boolean(infoEditOpen && isCursorInfo)}
        initial={infoItem?.cursorProDetail ?? null}
        paymentTitle={infoItem?.title}
        onClose={() => setInfoEditOpen(false)}
        onSave={(detail) => {
          void handleSaveCursorFromInfo(detail)
        }}
      />

      <AnnualNaverPlusViewDialog
        open={Boolean(isNaverInfo && !infoEditOpen)}
        title={infoItem?.title ?? ''}
        detail={infoItem?.naverPlusDetail ?? null}
        dueLabel={infoDueLabel}
        payType={infoPayType}
        cardTitle={infoCardTitle}
        onClose={() => setInfoItem(null)}
        onEdit={() => setInfoEditOpen(true)}
      />

      <AnnualNaverPlusEditorDialog
        open={Boolean(infoEditOpen && isNaverInfo)}
        initial={infoItem?.naverPlusDetail ?? null}
        paymentTitle={infoItem?.title}
        onClose={() => setInfoEditOpen(false)}
        onSave={(detail) => {
          void handleSaveNaverFromInfo(detail)
        }}
      />
    </>
  )
}
