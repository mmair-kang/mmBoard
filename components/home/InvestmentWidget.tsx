'use client'
// 수정: Auto — 2026-06-08

import { InvestmentAccountCard } from '@/components/home/InvestmentAccountCard'
import { InvestmentCashDialog } from '@/components/home/InvestmentCashDialog'
import { InvestmentHoldingFormDialog } from '@/components/home/InvestmentHoldingFormDialog'
import type { InvestmentAccountId } from '@/config/investmentAccounts'
import {
  type InvestmentAccountView,
  type InvestmentHoldingView,
  useInvestments,
} from '@/hooks/useInvestments'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { formatWon } from '@/lib/annualPaymentCalc'
import { formatReturnRate, returnTone } from '@/lib/investmentCalc'
import type { InvestmentCashPayload, InvestmentHoldingPayload } from '@/lib/investmentPayload'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo, useState } from 'react'

export function InvestmentWidget() {
  const { accounts, usdKrwRate, grandSummary, isLoading, mutate } = useInvestments()
  const [holdingFormOpen, setHoldingFormOpen] = useState(false)
  const [cashFormOpen, setCashFormOpen] = useState(false)
  const [activeAccountId, setActiveAccountId] = useState<InvestmentAccountId>('nh')
  const [editingHolding, setEditingHolding] = useState<InvestmentHoldingView | null>(null)

  const activeAccount = useMemo(
    () => accounts.find((row) => row.id === activeAccountId) ?? accounts[0],
    [accounts, activeAccountId],
  )

  const grandTone = returnTone(grandSummary?.returnRate ?? null)

  const openAdd = (accountId: InvestmentAccountId) => {
    setActiveAccountId(accountId)
    setEditingHolding(null)
    setHoldingFormOpen(true)
  }

  const openEditHolding = (account: InvestmentAccountView, holdingId: number) => {
    const holding = account.holdings.find((row) => row.id === holdingId) ?? null
    if (!holding) return
    setActiveAccountId(account.id)
    setEditingHolding(holding)
    setHoldingFormOpen(true)
  }

  const openEditCash = (accountId: InvestmentAccountId) => {
    setActiveAccountId(accountId)
    setCashFormOpen(true)
  }

  const closeHoldingForm = () => {
    setHoldingFormOpen(false)
    setEditingHolding(null)
  }

  const handleSaveHolding = async (payload: InvestmentHoldingPayload) => {
    if (editingHolding) {
      const res = await fetch(`/api/investments/holdings/${editingHolding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
      const updated = await res.json()
      await mutate(updated, { revalidate: false })
      return
    }

    const res = await fetch('/api/investments/holdings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const updated = await res.json()
    await mutate(updated, { revalidate: false })
  }

  const handleDeleteHolding = async () => {
    if (!editingHolding) return
    const res = await fetch(`/api/investments/holdings/${editingHolding.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '삭제에 실패했습니다'))
    const updated = await res.json()
    await mutate(updated, { revalidate: false })
  }

  const handleSaveCash = async (payload: InvestmentCashPayload) => {
    const res = await fetch('/api/investments/cash', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
    const updated = await res.json()
    await mutate(updated, { revalidate: false })
  }

  if (isLoading && !grandSummary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <>
      <Stack spacing={1.25} sx={{ width: '100%', minWidth: 0 }}>
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
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
            전체 투자 합산
            {usdKrwRate != null ? ` · 환율 ${usdKrwRate.toLocaleString('ko-KR')}원/$` : ''}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 0.35, flexWrap: 'wrap', rowGap: 0.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                평가
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>
                {grandSummary ? formatWon(grandSummary.totalCurrentKrw) : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                수익률
              </Typography>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  color: grandTone === 'up' ? 'error.main' : grandTone === 'down' ? 'info.main' : 'text.primary',
                }}
              >
                {formatReturnRate(grandSummary?.returnRate ?? null)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                수익금
              </Typography>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  color: grandTone === 'up' ? 'error.main' : grandTone === 'down' ? 'info.main' : 'text.primary',
                }}
              >
                {grandSummary ? formatWon(grandSummary.profitLossKrw) : '—'}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {accounts.map((account) => (
          <InvestmentAccountCard
            key={account.id}
            account={account}
            onAdd={() => openAdd(account.id)}
            onEditHolding={(holdingId) => openEditHolding(account, holdingId)}
            onEditCash={() => openEditCash(account.id)}
          />
        ))}
      </Stack>

      {activeAccount ? (
        <>
          <InvestmentHoldingFormDialog
            open={holdingFormOpen}
            accountId={activeAccount.id}
            holding={editingHolding}
            onClose={closeHoldingForm}
            onSubmit={handleSaveHolding}
            onDelete={editingHolding ? handleDeleteHolding : undefined}
          />
          <InvestmentCashDialog
            open={cashFormOpen}
            accountId={activeAccount.id}
            cashBalanceKrw={activeAccount.cashBalanceKrw}
            onClose={() => setCashFormOpen(false)}
            onSubmit={handleSaveCash}
          />
        </>
      ) : null}
    </>
  )
}
