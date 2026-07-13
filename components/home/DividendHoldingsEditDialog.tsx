'use client'
// 수정: Auto — 2026-07-14 02:00

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFormSx,
  formDialogPaperSlotSx,
} from '@/config/formDialogLayout'
import type { DividendHolding } from '@/hooks/useDividends'
import type { DividendHoldingPayload } from '@/lib/dividendPayload'
import { decimalToText, sanitizeDecimalInput } from '@/lib/dividendPayload'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'

type RowDraft = {
  shares: string
  perShare: string
}

type Props = {
  open: boolean
  holdings: DividendHolding[]
  usdKrwRate: number | null
  onClose: () => void
  onSubmit: (holdings: DividendHoldingPayload[]) => Promise<void>
}

export function DividendHoldingsEditDialog({ open, holdings, usdKrwRate, onClose, onSubmit }: Props) {
  const [rowDrafts, setRowDrafts] = useState<Record<number, RowDraft>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const hasOverseas = useMemo(() => holdings.some((row) => row.market === 'overseas'), [holdings])

  useEffect(() => {
    if (!open) {
      setRowDrafts({})
      setSubmitting(false)
      setFormError(null)
      return
    }

    const drafts: Record<number, RowDraft> = {}
    for (const row of holdings) {
      const perShare =
        row.market === 'domestic' ? row.perShareDividendKrw : row.perShareDividendUsd
      drafts[row.id] = {
        shares: row.defaultShares > 0 ? String(row.defaultShares) : '',
        perShare: decimalToText(perShare),
      }
    }
    setRowDrafts(drafts)
  }, [open, holdings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (hasOverseas && (usdKrwRate == null || usdKrwRate <= 0)) {
      setFormError('해외 종목 환율(투자 연동)을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    const payload: DividendHoldingPayload[] = []
    for (const row of holdings) {
      const draft = rowDrafts[row.id]
      if (!draft) continue
      const shares = Math.round(Number(draft.shares.replace(/[^\d]/g, ''))) || 0
      const perShareText = draft.perShare.trim()
      const perShareValue =
        !perShareText || perShareText === '.' ? 0 : Number(perShareText.replace(/[^\d.]/g, '')) || 0

      if (shares < 0 || perShareValue <= 0) {
        const unit = row.market === 'domestic' ? '주당 원' : '주당 $'
        setFormError(`${row.ticker}의 주수와 ${unit}를 확인해 주세요.`)
        return
      }

      payload.push({
        id: row.id,
        ticker: row.ticker,
        market: row.market,
        quoteSymbol: row.quoteSymbol,
        defaultShares: shares,
        perShareDividendUsd: row.market === 'overseas' ? perShareValue : 0,
        perShareDividendKrw: row.market === 'domestic' ? perShareValue : 0,
        referencePriceUsd: row.referencePriceUsd,
        referencePriceKrw: row.referencePriceKrw,
      })
    }

    if (payload.length === 0) {
      setFormError('저장할 종목이 없습니다.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '저장에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const overseasHoldings = holdings.filter((row) => row.market === 'overseas')
  const domesticHoldings = holdings.filter((row) => row.market === 'domestic')

  const renderRow = (row: DividendHolding, index: number, total: number) => {
    const draft = rowDrafts[row.id] ?? { shares: '', perShare: '' }
    const isDomestic = row.market === 'domestic'
    return (
      <Box key={row.id}>
        {index > 0 ? <Divider sx={{ my: 1 }} /> : null}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.9rem' }}>{row.ticker}</Typography>
          <Chip
            size="small"
            label={isDomestic ? '국내' : '해외'}
            color={isDomestic ? 'success' : 'default'}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700 }}
          />
        </Stack>
        {isDomestic ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            KODEX200타겟위클리커버드콜 · {row.quoteSymbol}
          </Typography>
        ) : null}
        <Stack spacing={0.75}>
          <TextField
            label="보유 주수"
            fullWidth
            value={draft.shares}
            onChange={(e) =>
              setRowDrafts((prev) => ({
                ...prev,
                [row.id]: { ...draft, shares: e.target.value.replace(/[^\d]/g, '') },
              }))
            }
            inputProps={{ inputMode: 'numeric' }}
            InputProps={{ endAdornment: <Typography variant="caption">주</Typography> }}
            {...formDialogCompactTextFieldProps}
          />
          <TextField
            label={isDomestic ? '주당 배당 (세전 원)' : '주당 배당 (세전 $)'}
            fullWidth
            value={draft.perShare}
            onChange={(e) =>
              setRowDrafts((prev) => ({
                ...prev,
                [row.id]: { ...draft, perShare: sanitizeDecimalInput(e.target.value) },
              }))
            }
            placeholder={isDomestic ? '120' : '0.45'}
            inputProps={{ inputMode: 'decimal' }}
            {...formDialogCompactTextFieldProps}
          />
        </Stack>
        {index < total - 1 ? null : null}
      </Box>
    )
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            ...formDialogPaperSlotSx,
            mx: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' },
          },
        },
      }}
    >
      <Box component="form" onSubmit={(e) => void handleSubmit(e)} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>보유 참고 수정</Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              {hasOverseas ? (
                <Paper
                  variant="outlined"
                  sx={{
                    px: 1,
                    py: 0.85,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.16),
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        해외 환율
                      </Typography>
                      <Chip
                        size="small"
                        label="투자연동"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700 }}
                      />
                    </Stack>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.9rem' }}>
                      {usdKrwRate != null ? `${usdKrwRate.toLocaleString('ko-KR')}원/$` : '—'}
                    </Typography>
                  </Stack>
                </Paper>
              ) : null}

              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
                해외·국내 배당을 한 화면에서 관리합니다. 국내는 원화 기준, 해외는 달러 기준으로 입력하세요.
              </Typography>

              {overseasHoldings.length > 0 ? (
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: 'text.secondary', mb: 0.5 }}>
                    해외 배당
                  </Typography>
                  {overseasHoldings.map((row, index) => renderRow(row, index, overseasHoldings.length))}
                </Box>
              ) : null}

              {domesticHoldings.length > 0 ? (
                <Box>
                  {overseasHoldings.length > 0 ? <Divider sx={{ my: 0.5 }} /> : null}
                  <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: 'success.dark', mb: 0.5 }}>
                    국내 배당
                  </Typography>
                  {domesticHoldings.map((row, index) => renderRow(row, index, domesticHoldings.length))}
                </Box>
              ) : null}

              {formError ? (
                <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter submitLoading={submitting} submitLabel="저장" />
      </Box>
    </AppDialog>
  )
}
