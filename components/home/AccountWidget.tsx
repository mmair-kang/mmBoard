'use client'
// 수정: Auto — 2026-06-08

import { FreshAmountField } from '@/components/common/FreshAmountField'
import { AccountFormDialog } from '@/components/home/AccountFormDialog'
import { AccountOutflowFormDialog } from '@/components/home/AccountOutflowFormDialog'
import { type MainAccount, useAccount } from '@/hooks/useAccount'
import { calcAccountProjectedBalance, formatWon } from '@/lib/accountCalc'
import { readApiErrorMessage } from '@/lib/apiResponse'
import type { OutflowPayload } from '@/lib/accountPayload'
import { formatMonthlyDayLabel } from '@/lib/monthlyDayLabel'
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

function OutflowRow({
  outflow,
  saving,
  onSwitchChange,
}: {
  outflow: MainAccount['outflows'][number]
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
          outflow.switchOn
            ? alpha(theme.palette.success.main, 0.08)
            : alpha(theme.palette.action.hover, 0.04),
        border: 1,
        borderColor: outflow.switchOn ? 'success.light' : 'divider',
      }}
    >
      <Chip
        size="small"
        label={formatMonthlyDayLabel(outflow.dayOfMonth)}
        sx={{ height: 22, minWidth: 40, fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}
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
        {outflow.title}
      </Typography>
      <Typography
        sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'text.secondary', flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        {formatWon(outflow.amount)}
      </Typography>
      <Switch
        size="small"
        checked={outflow.switchOn}
        onChange={(_, checked) => void onSwitchChange(checked)}
        disabled={saving}
        color={outflow.switchOn ? 'success' : 'default'}
        sx={{ flexShrink: 0 }}
      />
    </Stack>
  )
}

export function AccountWidget() {
  const { account, isLoading, mutate } = useAccount()
  const [saving, setSaving] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const monthLabel = dayjs().format('M월')

  const projection = useMemo(() => {
    if (!account) return { pendingTotal: 0, projectedBalance: 0 }
    return calcAccountProjectedBalance(account.balance, account.outflows)
  }, [account])

  const outflowTotal = useMemo(() => {
    if (!account) return 0
    return account.outflows.reduce((sum, row) => sum + row.amount, 0)
  }, [account])

  const commitBalance = async (parsed: number) => {
    if (!account) return
    setSaving(true)
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: parsed }),
      })
      if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
      const updated = (await res.json()) as MainAccount
      await mutate(updated, { revalidate: false })
      await mutate()
    } finally {
      setSaving(false)
    }
  }

  const handleAddOutflow = async (payload: OutflowPayload) => {
    const res = await fetch('/api/account/outflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const updated = (await res.json()) as MainAccount
    await mutate(updated, { revalidate: false })
    await mutate()
  }

  const handleSettingsSave = async (payload: { name: string; outflows: OutflowPayload[] }) => {
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
    const updated = (await res.json()) as MainAccount
    await mutate(updated, { revalidate: false })
    await mutate()
  }

  const handleOutflowSwitch = async (outflowId: number, switchOn: boolean) => {
    if (!account) return
    setSaving(true)
    try {
      const res = await fetch(`/api/account/outflows/${outflowId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ switchOn }),
      })
      if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
      const updated = (await res.json()) as MainAccount
      await mutate(updated, { revalidate: false })
      await mutate()
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !account) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 3 }}>
        <Stack alignItems="center">
          <CircularProgress size={28} />
        </Stack>
      </Paper>
    )
  }

  const projectedLow = projection.projectedBalance < 0

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
          spacing={0.75}
          sx={{ px: 1.25, py: 1.1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', flex: 1, minWidth: 0 }} noWrap>
            {account.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, flexShrink: 0 }}>
            {monthLabel}
          </Typography>
          <Tooltip title="출금 예정 추가">
            <IconButton size="small" color="primary" onClick={() => setAddOpen(true)} aria-label="출금 예정 추가">
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="계좌 설정">
            <IconButton size="small" onClick={() => setSettingsOpen(true)} aria-label="계좌 설정">
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ px: 1.25, py: 1.1 }}>
          <Box sx={{ mb: 0.75 }}>
            <FreshAmountField
              label="잔액"
              value={account.balance}
              onCommit={commitBalance}
              disabled={saving}
              large
            />
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 1.1,
              py: 0.65,
              borderRadius: 1.75,
              bgcolor: (theme) =>
                projectedLow
                  ? alpha(theme.palette.error.main, 0.08)
                  : alpha(theme.palette.primary.main, 0.06),
              border: 1,
              borderColor: projectedLow ? 'error.light' : 'primary.light',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              예상 잔액
            </Typography>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '0.95rem',
                color: projectedLow ? 'error.dark' : 'primary.dark',
              }}
            >
              {formatWon(projection.projectedBalance)}
            </Typography>
          </Stack>
        </Box>

        {account.outflows.length > 0 ? (
          <Stack spacing={0.75} sx={{ px: 1.25, pb: 1.25 }}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={1}
              sx={{ px: 0.25 }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, pt: 0.25 }}>
                출금 예정
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', lineHeight: 1.3 }}>
                  <Box
                    component="span"
                    sx={{ color: projection.pendingTotal > 0 ? 'text.primary' : 'success.main' }}
                  >
                    {formatWon(projection.pendingTotal)}
                  </Box>
                  <Box component="span" sx={{ color: 'text.disabled', mx: 0.5, fontWeight: 700 }}>
                    /
                  </Box>
                  <Box component="span">{formatWon(outflowTotal)}</Box>
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600, fontSize: '0.68rem', lineHeight: 1.35, mt: 0.2, display: 'block' }}
                >
                  남은 출금 예정액 / 총 출금 예정액
                </Typography>
              </Box>
            </Stack>
            {account.outflows.map((outflow) => (
              <OutflowRow
                key={outflow.id}
                outflow={outflow}
                saving={saving}
                onSwitchChange={(switchOn) => handleOutflowSwitch(outflow.id, switchOn)}
              />
            ))}
          </Stack>
        ) : (
          <Stack alignItems="center" py={2.5} px={1.5} color="text.secondary">
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>출금 예정이 없습니다</Typography>
            <Typography variant="caption">+ 버튼으로 이번 달 출금을 추가해 보세요</Typography>
          </Stack>
        )}
      </Paper>

      <AccountOutflowFormDialog open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAddOutflow} />

      <AccountFormDialog
        open={settingsOpen}
        account={account}
        onClose={() => setSettingsOpen(false)}
        onSubmit={handleSettingsSave}
      />
    </>
  )
}
