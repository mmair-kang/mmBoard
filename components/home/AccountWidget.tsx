'use client'
// 수정: Auto — 2026-07-21 22:00 (관리계좌 헤더·목록)
// 수정: Auto — 2026-07-21 21:50 (성남사랑·IBK 한 카드)
// 수정: Auto — 2026-07-21 21:46 (IBK청약 정보 모달)
// 수정: Auto — 2026-07-21 21:43 (IBK 잔액 undefined 방어)
// 수정: Auto — 2026-07-21 21:36 (IBK청약 + 잔액 카드 높이 축소)

import { FreshAmountField } from '@/components/common/FreshAmountField'
import { AccountFormDialog } from '@/components/home/AccountFormDialog'
import { AccountOutflowFormDialog } from '@/components/home/AccountOutflowFormDialog'
import { IbkSubscriptionInfoDialog } from '@/components/home/IbkSubscriptionInfoDialog'
import { ManagedAccountsFormDialog } from '@/components/home/ManagedAccountsFormDialog'
import { type MainAccount, type ManagedAccount, useAccount } from '@/hooks/useAccount'
import { calcAccountProjectedBalance, formatWon } from '@/lib/accountCalc'
import { readApiErrorMessage } from '@/lib/apiResponse'
import type { ManagedAccountPayload, OutflowPayload } from '@/lib/accountPayload'
import { formatMonthlyDayLabel } from '@/lib/monthlyDayLabel'
import { formatRelativeDayKo } from '@/lib/relativeDayLabel'
import { inactiveSwitchRowBg } from '@/lib/widgetSurfaces'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
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

function accountBlueSurface(theme: Theme) {
  return {
    borderColor: alpha(theme.palette.primary.main, 0.22),
    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.09 : 0.04),
  }
}

function managedAccountSurface(theme: Theme) {
  return {
    borderColor: alpha(theme.palette.success.main, 0.28),
    bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
  }
}

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
            ? alpha(theme.palette.primary.main, 0.08)
            : inactiveSwitchRowBg(theme),
        border: 1,
        borderColor: (theme) =>
          outflow.switchOn ? alpha(theme.palette.primary.main, 0.28) : theme.palette.divider,
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
        color={outflow.switchOn ? 'primary' : 'default'}
        sx={{ flexShrink: 0 }}
      />
    </Stack>
  )
}

function ManagedAccountBalanceRow({
  row,
  saving,
  onCommit,
  onInfoClick,
}: {
  row: ManagedAccount
  saving: boolean
  onCommit: (balance: number) => Promise<void>
  onInfoClick?: () => void
}) {
  const updatedLabel = formatRelativeDayKo(row.balanceUpdatedAt)
  const showInfo = row.accountType === 'subscription' && onInfoClick

  return (
    <Box
      sx={(theme) => ({
        borderRadius: 2,
        border: 1,
        px: 0.9,
        py: 0.55,
        ...managedAccountSurface(theme),
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 0.35, gap: 0.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.15} sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              color: 'success.dark',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.name}
          </Typography>
          {showInfo ? (
            <Tooltip title="청약통장 안내">
              <IconButton
                size="small"
                color="success"
                onClick={onInfoClick}
                aria-label={`${row.name} 안내`}
                sx={{ p: 0.15 }}
              >
                <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
        {updatedLabel ? (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ fontWeight: 600, fontSize: '0.66rem', flexShrink: 0 }}
          >
            {updatedLabel}
          </Typography>
        ) : null}
      </Stack>
      <FreshAmountField
        value={row.balance ?? 0}
        onCommit={onCommit}
        disabled={saving}
        compact
        softInput="success"
      />
    </Box>
  )
}

export function AccountWidget() {
  const { account, isLoading, mutate } = useAccount()
  const [saving, setSaving] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [managedSettingsOpen, setManagedSettingsOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [subscriptionInfoOpen, setSubscriptionInfoOpen] = useState(false)

  const monthLabel = dayjs().format('M월')

  const projection = useMemo(() => {
    if (!account) return { pendingTotal: 0, projectedBalance: 0 }
    return calcAccountProjectedBalance(account.balance, account.outflows)
  }, [account])

  const outflowTotal = useMemo(() => {
    if (!account) return 0
    return account.outflows.reduce((sum, row) => sum + row.amount, 0)
  }, [account])

  const balanceUpdatedLabel = useMemo(() => {
    if (!account) return null
    return formatRelativeDayKo(account.balanceUpdatedAt ?? account.updatedAt)
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
    } finally {
      setSaving(false)
    }
  }

  const commitManagedBalance = async (managedAccountId: number, parsed: number) => {
    if (!account) return
    setSaving(true)
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managedAccountId, balance: parsed }),
      })
      if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
      const updated = (await res.json()) as MainAccount
      await mutate(updated, { revalidate: false })
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
  }

  const handleManagedSettingsSave = async (payload: {
    managedGroupName: string
    managedAccounts: ManagedAccountPayload[]
  }) => {
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
    const updated = (await res.json()) as MainAccount
    await mutate(updated, { revalidate: false })
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
    } finally {
      setSaving(false)
    }
  }

  if (!account) {
    if (isLoading) {
      return (
        <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 3 }}>
          <Stack alignItems="center">
            <CircularProgress size={28} />
          </Stack>
        </Paper>
      )
    }
    return null
  }

  const projectedLow = projection.projectedBalance < 0
  const managedAccounts = account.managedAccounts ?? []

  return (
    <Stack spacing={1}>
      <Paper
        variant="outlined"
        sx={(theme) => ({
          borderRadius: 2.5,
          overflow: 'hidden',
          borderColor: alpha(theme.palette.primary.main, 0.18),
          boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.06)}`,
        })}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={(theme) => ({
            px: 1.25,
            py: 0.45,
            minHeight: 30,
            borderBottom: 1,
            borderColor: alpha(theme.palette.primary.main, 0.12),
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.06 : 0.025),
          })}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', flex: 1, minWidth: 0, lineHeight: 1.2 }} noWrap>
            {account.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, flexShrink: 0, lineHeight: 1.2 }}
          >
            {monthLabel}
          </Typography>
          <Tooltip title="출금 예정 추가">
            <IconButton
              size="small"
              color="primary"
              onClick={() => setAddOpen(true)}
              aria-label="출금 예정 추가"
              sx={{ p: 0.35 }}
            >
              <AddRoundedIcon sx={{ fontSize: '1.15rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="계좌 설정">
            <IconButton size="small" onClick={() => setSettingsOpen(true)} aria-label="계좌 설정" sx={{ p: 0.35 }}>
              <EditRoundedIcon sx={{ fontSize: '1.05rem' }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ px: 1.25, py: 0.7 }}>
          <Box
            sx={(theme) => ({
              borderRadius: 2,
              border: 1,
              px: 0.9,
              py: 0.65,
              ...accountBlueSurface(theme),
            })}
          >
            <Stack
              direction="row"
              alignItems="baseline"
              justifyContent="space-between"
              sx={{ mb: 0.4, gap: 1 }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, fontSize: '0.7rem', color: 'primary.dark' }}
              >
                잔액
              </Typography>
              {balanceUpdatedLabel ? (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontWeight: 600, fontSize: '0.66rem', flexShrink: 0 }}
                >
                  {balanceUpdatedLabel}
                </Typography>
              ) : null}
            </Stack>

            <FreshAmountField
              value={account.balance ?? 0}
              onCommit={commitBalance}
              disabled={saving}
              compact
              softInput="primary"
            />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={(theme) => ({
                mt: 0.5,
                pt: 0.5,
                borderTop: 1,
                borderColor: alpha(theme.palette.primary.main, 0.14),
              })}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, fontSize: '0.7rem', color: 'primary.dark' }}
              >
                예상 잔액
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  fontVariantNumeric: 'tabular-nums',
                  color: projectedLow ? 'error.main' : 'primary.dark',
                }}
              >
                {formatWon(projection.projectedBalance)}
              </Typography>
            </Stack>
          </Box>
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
                    sx={{ color: projection.pendingTotal > 0 ? 'text.primary' : 'primary.main' }}
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

      <Paper
        variant="outlined"
        sx={(theme) => ({
          borderRadius: 2.5,
          overflow: 'hidden',
          borderColor: alpha(theme.palette.success.main, 0.28),
          boxShadow: `0 1px 3px ${alpha(theme.palette.success.main, 0.06)}`,
        })}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={(theme) => ({
            px: 1.25,
            py: 0.45,
            minHeight: 30,
            borderBottom: 1,
            borderColor: alpha(theme.palette.success.main, 0.16),
            bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
          })}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', flex: 1, minWidth: 0, lineHeight: 1.2 }} noWrap>
            {account.managedGroupName || '관리계좌'}
          </Typography>
          <Tooltip title="관리계좌 설정">
            <IconButton
              size="small"
              onClick={() => setManagedSettingsOpen(true)}
              aria-label="관리계좌 설정"
              sx={{ p: 0.35 }}
            >
              <EditRoundedIcon sx={{ fontSize: '1.05rem' }} />
            </IconButton>
          </Tooltip>
        </Stack>

        {managedAccounts.length > 0 ? (
          <Stack spacing={0.85} sx={{ px: 1.25, py: 0.7 }}>
            {managedAccounts.map((row) => (
              <ManagedAccountBalanceRow
                key={row.id}
                row={row}
                saving={saving}
                onCommit={(balance) => commitManagedBalance(row.id, balance)}
                onInfoClick={
                  row.accountType === 'subscription'
                    ? () => setSubscriptionInfoOpen(true)
                    : undefined
                }
              />
            ))}
          </Stack>
        ) : (
          <Stack alignItems="center" py={2.5} px={1.5} color="text.secondary">
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>관리계좌가 없습니다</Typography>
            <Typography variant="caption">수정 버튼으로 계좌를 추가해 보세요</Typography>
          </Stack>
        )}
      </Paper>

      <IbkSubscriptionInfoDialog
        open={subscriptionInfoOpen}
        onClose={() => setSubscriptionInfoOpen(false)}
      />

      <AccountOutflowFormDialog open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAddOutflow} />

      <AccountFormDialog
        open={settingsOpen}
        account={account}
        onClose={() => setSettingsOpen(false)}
        onSubmit={handleSettingsSave}
      />

      <ManagedAccountsFormDialog
        open={managedSettingsOpen}
        account={account}
        onClose={() => setManagedSettingsOpen(false)}
        onSubmit={handleManagedSettingsSave}
      />
    </Stack>
  )
}
