'use client'
// 수정: Auto — 2026-06-11

import { InvestmentAccountCard } from '@/components/home/InvestmentAccountCard'
import { InvestmentAccountDetailDialog } from '@/components/home/InvestmentAccountDetailDialog'
import { InvestmentAccountEditDialog } from '@/components/home/InvestmentAccountEditDialog'
import type { InvestmentAccountId } from '@/config/investmentAccounts'
import { type InvestmentAccountView, useInvestments } from '@/hooks/useInvestments'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { formatWon } from '@/lib/annualPaymentCalc'
import { formatReturnRate, returnTone } from '@/lib/investmentCalc'
import type { InvestmentAccountSyncPayload } from '@/lib/investmentPayload'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo, useState } from 'react'

export function InvestmentWidget() {
  const { accounts, usdKrwRate, grandSummary, isLoading, mutate } = useInvestments()
  const [detailAccountId, setDetailAccountId] = useState<InvestmentAccountId | null>(null)
  const [editAccountId, setEditAccountId] = useState<InvestmentAccountId | null>(null)

  const detailAccount = useMemo(
    () => accounts.find((row) => row.id === detailAccountId) ?? null,
    [accounts, detailAccountId],
  )

  const editAccount = useMemo(
    () => accounts.find((row) => row.id === editAccountId) ?? null,
    [accounts, editAccountId],
  )

  const grandTone = returnTone(grandSummary?.returnRate ?? null)

  const openDetail = (account: InvestmentAccountView) => {
    setDetailAccountId(account.id)
  }

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
            onOpenDetail={() => openDetail(account)}
            onEdit={() => openEdit(account)}
          />
        ))}
      </Stack>

      <InvestmentAccountDetailDialog
        open={detailAccountId != null}
        account={detailAccount}
        onClose={() => setDetailAccountId(null)}
      />

      <InvestmentAccountEditDialog
        open={editAccountId != null}
        account={editAccount}
        onClose={() => setEditAccountId(null)}
        onSubmit={handleSaveAccount}
      />
    </>
  )
}
