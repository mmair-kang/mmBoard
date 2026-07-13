'use client'
// 수정: Auto — 2026-07-14 01:29 (아파트·대출 통합·순서)
// 수정: Auto — 2026-07-14 01:29 (연동 라벨)
// 수정: Auto — 2026-07-14 01:27 (금리·납부일 모달 편집)
// 수정: Auto — 2026-07-14 01:23 (보금자리론 상세 모달)
// 수정: Auto — 2026-07-13 23:56
// 수정: Auto — 2026-07-13 23:54 (보금자리론 스타일)
// 수정: Auto — 2026-07-13 23:43

import { FreshAmountField } from '@/components/common/FreshAmountField'
import { BogeumjariLoanDetailDialog } from '@/components/home/BogeumjariLoanDetailDialog'
import { useAccount } from '@/hooks/useAccount'
import { useAssetSettings } from '@/hooks/useAssetSettings'
import { useInvestments } from '@/hooks/useInvestments'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { calcAssetBreakdown } from '@/lib/assetCalc'
import { formatWon } from '@/lib/accountCalc'
import { formatRelativeDayKo } from '@/lib/relativeDayLabel'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo, useState } from 'react'

type AssetPatch = {
  apartmentValue?: number
  bogeumjariLoan?: number
  bogeumjariLoanRate?: number
  bogeumjariMonthlyPayment?: number
  bogeumjariPaymentDay?: number
}

function AssetAutoRow({
  label,
  amount,
  hint,
  syncLabel,
}: {
  label: string
  amount: number
  hint: string
  syncLabel: string
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 2,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack spacing={0.2} sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem' }}>{label}</Typography>
            <Chip
              size="small"
              label={syncLabel}
              sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700 }}
              color="primary"
              variant="outlined"
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {hint}
          </Typography>
        </Stack>
        <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {formatWon(amount)}
        </Typography>
      </Stack>
    </Paper>
  )
}

function ApartmentLoanCard({
  apartmentValue,
  bogeumjariLoan,
  apartmentUpdatedLabel,
  bogeumjariUpdatedLabel,
  saving,
  onApartmentCommit,
  onLoanCommit,
  onLoanInfoClick,
}: {
  apartmentValue: number
  bogeumjariLoan: number
  apartmentUpdatedLabel: string | null
  bogeumjariUpdatedLabel: string | null
  saving: boolean
  onApartmentCommit: (amount: number) => Promise<void>
  onLoanCommit: (amount: number) => Promise<void>
  onLoanInfoClick: () => void
}) {
  const netPropertyKrw = apartmentValue - bogeumjariLoan

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 2,
        borderColor: 'divider',
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem' }}>아파트</Typography>
          <Stack alignItems="flex-end" spacing={0.1}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.64rem' }}>
              순가치
            </Typography>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '0.88rem',
                color: netPropertyKrw >= 0 ? 'text.primary' : 'error.main',
                whiteSpace: 'nowrap',
              }}
            >
              {formatWon(netPropertyKrw)}
            </Typography>
          </Stack>
        </Stack>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            시세 또는 추정 가치
          </Typography>
          <FreshAmountField
            value={apartmentValue}
            onCommit={onApartmentCommit}
            disabled={saving}
            large
            softInput="primary"
            leadingLabel={apartmentUpdatedLabel}
          />
        </Box>

        <Box
          sx={(theme) => ({
            pt: 0.85,
            borderTop: 1,
            borderColor: alpha(theme.palette.error.main, 0.12),
          })}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={0.25}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: 'text.secondary' }}>
                보금자리론
              </Typography>
              <IconButton
                size="small"
                aria-label="보금자리론 상세 정보"
                onClick={onLoanInfoClick}
                sx={{ p: 0.35, color: 'text.disabled' }}
              >
                <InfoOutlinedIcon sx={{ fontSize: '0.95rem' }} />
              </IconButton>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.64rem' }}>
              대출잔액
            </Typography>
          </Stack>
          <FreshAmountField
            value={bogeumjariLoan}
            onCommit={onLoanCommit}
            disabled={saving}
            large
            softInput="loan"
            leadingLabel={bogeumjariUpdatedLabel}
          />
        </Box>
      </Stack>
    </Paper>
  )
}

export function AssetWidget() {
  const { accounts, isLoading: investmentsLoading } = useInvestments()
  const { account, isLoading: accountLoading } = useAccount()
  const {
    apartmentValue,
    apartmentValueUpdatedAt,
    bogeumjariLoan,
    bogeumjariLoanUpdatedAt,
    bogeumjariLoanRate,
    bogeumjariMonthlyPayment,
    bogeumjariPaymentDay,
    isLoading: settingsLoading,
    mutate,
  } = useAssetSettings()
  const [saving, setSaving] = useState(false)
  const [loanDetailOpen, setLoanDetailOpen] = useState(false)

  const summary = useMemo(() => {
    return calcAssetBreakdown(accounts, account?.balance ?? 0, {
      apartmentValue,
      apartmentValueUpdatedAt,
      bogeumjariLoan,
      bogeumjariLoanUpdatedAt,
      bogeumjariLoanRate,
      bogeumjariMonthlyPayment,
      bogeumjariPaymentDay,
    })
  }, [
    accounts,
    account?.balance,
    apartmentValue,
    apartmentValueUpdatedAt,
    bogeumjariLoan,
    bogeumjariLoanUpdatedAt,
    bogeumjariLoanRate,
    bogeumjariMonthlyPayment,
    bogeumjariPaymentDay,
  ])

  const apartmentUpdatedLabel = useMemo(
    () => formatRelativeDayKo(apartmentValueUpdatedAt),
    [apartmentValueUpdatedAt],
  )
  const bogeumjariUpdatedLabel = useMemo(
    () => formatRelativeDayKo(bogeumjariLoanUpdatedAt),
    [bogeumjariLoanUpdatedAt],
  )

  const isLoading = (investmentsLoading && accounts.length === 0) || (accountLoading && !account) || settingsLoading

  const patchSettings = async (partial: AssetPatch) => {
    setSaving(true)
    try {
      const res = await fetch('/api/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      })
      if (!res.ok) throw new Error(await readApiErrorMessage(res, '저장에 실패했습니다'))
      const updated = await res.json()
      await mutate(updated, { revalidate: false })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <Stack spacing={1.25} sx={{ width: '100%', minWidth: 0 }}>
      <Paper
        variant="outlined"
        sx={{
          px: 1.5,
          py: 1.25,
          borderRadius: 2.5,
          bgcolor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
          borderColor: (theme) => alpha(theme.palette.success.main, 0.28),
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.35 }}>
          순자산
        </Typography>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: '1.45rem', sm: '1.65rem' },
            color: summary.netAssetsKrw >= 0 ? 'success.dark' : 'error.main',
            lineHeight: 1.2,
          }}
        >
          {formatWon(summary.netAssetsKrw)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
          총 자산 {formatWon(summary.grossAssetsKrw)}
          {summary.bogeumjariLoan > 0 ? ` − 대출 ${formatWon(summary.bogeumjariLoan)}` : ''}
        </Typography>
      </Paper>

      <ApartmentLoanCard
        apartmentValue={apartmentValue}
        bogeumjariLoan={bogeumjariLoan}
        apartmentUpdatedLabel={apartmentUpdatedLabel}
        bogeumjariUpdatedLabel={bogeumjariUpdatedLabel}
        saving={saving}
        onApartmentCommit={(amount) => patchSettings({ apartmentValue: amount })}
        onLoanCommit={(amount) => patchSettings({ bogeumjariLoan: amount })}
        onLoanInfoClick={() => setLoanDetailOpen(true)}
      />

      <AssetAutoRow
        label="계좌 잔액"
        amount={summary.accountBalanceKrw}
        hint="계좌 탭 · 현재 잔액"
        syncLabel="계좌연동"
      />

      <AssetAutoRow
        label="국내주식"
        amount={summary.domesticStocksKrw}
        hint="투자 탭 · NH 국내주식 계좌"
        syncLabel="투자연동"
      />

      <AssetAutoRow
        label="해외배당"
        amount={summary.overseasDividendKrw}
        hint="투자 탭 · DS 해외 배당주 계좌"
        syncLabel="투자연동"
      />

      <AssetAutoRow
        label="연금계좌"
        amount={summary.pensionKrw}
        hint="투자 탭 · 연금저축펀드 + IRP 합산"
        syncLabel="투자연동"
      />

      <BogeumjariLoanDetailDialog
        open={loanDetailOpen}
        balance={bogeumjariLoan}
        annualRatePercent={bogeumjariLoanRate}
        paymentDay={bogeumjariPaymentDay}
        monthlyPayment={bogeumjariMonthlyPayment}
        saving={saving}
        onRateCommit={(rate) => patchSettings({ bogeumjariLoanRate: rate })}
        onPaymentDayCommit={(day) => patchSettings({ bogeumjariPaymentDay: day })}
        onMonthlyPaymentCommit={(amount) => patchSettings({ bogeumjariMonthlyPayment: amount })}
        onClose={() => setLoanDetailOpen(false)}
      />
    </Stack>
  )
}
