'use client'
// 수정: Auto — 2026-07-14 01:39 (표 클릭 수정·예수금 인라인)
// 수정: Auto — 2026-06-15 (PC 타이포·굵기 균형)

import { InvestmentAccountCard } from '@/components/home/InvestmentAccountCard'
import { InvestmentAccountEditDialog } from '@/components/home/InvestmentAccountEditDialog'
import type { InvestmentAccountId } from '@/config/investmentAccounts'
import { type InvestmentAccountView, useInvestments } from '@/hooks/useInvestments'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { formatWon } from '@/lib/annualPaymentCalc'
import { formatReturnRate, returnTone } from '@/lib/investmentCalc'
import type { InvestmentAccountSyncPayload } from '@/lib/investmentPayload'
import { sxDesktopTwoColumnGrid } from '@/config/responsiveLayout'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo, useState } from 'react'

export function InvestmentWidget() {
  const { accounts, usdKrwRate, grandSummary, isLoading, mutate } = useInvestments()
  const [editAccountId, setEditAccountId] = useState<InvestmentAccountId | null>(null)
  const [cashSavingId, setCashSavingId] = useState<InvestmentAccountId | null>(null)

  const editAccount = useMemo(
    () => accounts.find((row) => row.id === editAccountId) ?? null,
    [accounts, editAccountId],
  )

  const grandTone = returnTone(grandSummary?.returnRate ?? null)

  const openEdit = (account: InvestmentAccountView) => {
    setEditAccountId(account.id)
  }

  const handleSaveAccount = async (payload: InvestmentAccountSyncPayload) => {
    const res = await fetch('/api/investments/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
    const updated = await res.json()
    await mutate(updated, { revalidate: false })
  }

  const handleSaveCash = async (accountId: InvestmentAccountId, cashBalance: number) => {
    setCashSavingId(accountId)
    try {
      const res = await fetch('/api/investments/cash', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: accountId, cashBalance }),
      })
      if (!res.ok) throw new Error(await readApiErrorMessage(res, '예수금 저장에 실패했습니다'))
      const updated = await res.json()
      await mutate(updated, { revalidate: false })
    } finally {
      setCashSavingId(null)
    }
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
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
            전체 투자 합산
            {usdKrwRate != null ? ` · 환율 ${usdKrwRate.toLocaleString('ko-KR')}원/$` : ''}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 0.35, flexWrap: 'wrap', rowGap: 0.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                평가
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', md: '0.95rem' } }}>
                {grandSummary ? formatWon(grandSummary.totalCurrentKrw) : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                수익률
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: grandTone === 'up' ? 'error.main' : grandTone === 'down' ? 'info.main' : 'text.primary',
                }}
              >
                {formatReturnRate(grandSummary?.returnRate ?? null)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                수익금
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: grandTone === 'up' ? 'error.main' : grandTone === 'down' ? 'info.main' : 'text.primary',
                }}
              >
                {grandSummary ? formatWon(grandSummary.profitLossKrw) : '—'}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Box sx={sxDesktopTwoColumnGrid}>
          {accounts.map((account) => (
            <InvestmentAccountCard
              key={account.id}
              account={account}
              cashSaving={cashSavingId === account.id}
              onOpenEdit={() => openEdit(account)}
              onCashCommit={(amount) => handleSaveCash(account.id, amount)}
            />
          ))}
        </Box>
      </Stack>

      <InvestmentAccountEditDialog
        open={editAccountId != null}
        account={editAccount}
        onClose={() => setEditAccountId(null)}
        onSubmit={handleSaveAccount}
      />
    </>
  )
}
