'use client'
// 수정: Auto — 2026-06-08

import { AnnualPaymentFormDialog } from '@/components/home/AnnualPaymentFormDialog'
import { AnnualPaymentSettingsDialog } from '@/components/home/AnnualPaymentSettingsDialog'
import { type AnnualPayment, useAnnualPayments } from '@/hooks/useAnnualPayments'
import { calcAnnualPaymentSummary, formatWon } from '@/lib/annualPaymentCalc'
import { formatAnnualDueLabel } from '@/lib/annualPaymentLabel'
import { readApiErrorMessage } from '@/lib/apiResponse'
import type { AnnualPaymentPayload } from '@/lib/annualPaymentPayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

function PaymentRow({
  payment,
  saving,
  onSwitchChange,
}: {
  payment: AnnualPayment
  saving: boolean
  onSwitchChange: (switchOn: boolean) => Promise<void>
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        px: 1,
        py: 0.55,
        borderRadius: 1.5,
        bgcolor: (theme) =>
          payment.switchOn
            ? alpha(theme.palette.success.main, 0.08)
            : alpha(theme.palette.action.hover, 0.04),
        border: 1,
        borderColor: payment.switchOn ? 'success.light' : 'divider',
      }}
    >
      <Chip
        size="small"
        label={formatAnnualDueLabel(payment.month, payment.dayOfMonth)}
        sx={{ height: 22, fontWeight: 800, fontSize: '0.68rem', flexShrink: 0 }}
        variant="outlined"
        color="primary"
      />
      <Typography
        sx={{
          flex: 1,
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
      <Typography
        sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'text.secondary', flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        {formatWon(payment.amount)}
      </Typography>
      <Switch
        size="small"
        checked={payment.switchOn}
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
  const [saving, setSaving] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const yearLabel = dayjs().format('YYYY년')

  const summary = useMemo(() => calcAnnualPaymentSummary(payments), [payments])
  const allPaid = summary.totalAmount > 0 && summary.remainingAmount === 0

  const handleAdd = async (payload: AnnualPaymentPayload) => {
    const res = await fetch('/api/annual-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const updated = (await res.json()) as AnnualPayment[]
    await mutate(updated, { revalidate: false })
    await mutate()
  }

  const handleSettingsSave = async (payload: AnnualPaymentPayload[]) => {
    const res = await fetch('/api/annual-payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payments: payload }),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
    const updated = (await res.json()) as AnnualPayment[]
    await mutate(updated, { revalidate: false })
    await mutate()
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
      await mutate()
    } finally {
      setSaving(false)
    }
  }

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
            <IconButton size="small" color="primary" onClick={() => setAddOpen(true)} aria-label="연납 추가">
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="연납 설정">
            <IconButton size="small" onClick={() => setSettingsOpen(true)} aria-label="연납 설정">
              <EditRoundedIcon fontSize="small" />
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
              py: 0.65,
              borderRadius: 1.75,
              bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
              border: 1,
              borderColor: 'divider',
              mb: 0.75,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              총 납부 금액
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>
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
              bgcolor: (theme) =>
                allPaid
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.06),
              border: 1,
              borderColor: allPaid ? 'success.light' : 'primary.light',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              남은 금액
            </Typography>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '0.95rem',
                color: allPaid ? 'success.dark' : 'primary.dark',
              }}
            >
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
                onSwitchChange={(switchOn) => handleSwitch(payment.id, switchOn)}
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

      <AnnualPaymentFormDialog open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdd} />

      <AnnualPaymentSettingsDialog
        open={settingsOpen}
        payments={payments}
        onClose={() => setSettingsOpen(false)}
        onSubmit={handleSettingsSave}
      />
    </>
  )
}
