'use client'
// 수정: Auto — 2026-08-03 10:21 (배당 기준일 입력)
// 수정: Auto — 2026-07-24 15:40 (주식수 투자연동 읽기전용)
// 수정: Auto — 2026-07-14 23:37

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { MonthlyDaySelect } from '@/components/home/MonthlyDaySelect'
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
import { calcDomesticNetFromCashAndTaxBase, formatKrw } from '@/lib/dividendCalc'
import type { DividendHoldingPayload } from '@/lib/dividendPayload'
import { decimalToText, parseDecimalText, sanitizeDecimalInput } from '@/lib/dividendPayload'
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
  perShare: string
  taxBase: string
  recordDayOfMonth: number
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
        perShare: decimalToText(perShare),
        taxBase: row.market === 'domestic' ? decimalToText(row.perShareTaxBaseKrw) : '',
        recordDayOfMonth: row.recordDayOfMonth >= 1 && row.recordDayOfMonth <= 31 ? row.recordDayOfMonth : 1,
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
      const shares = row.defaultShares
      const perShareValue = parseDecimalText(draft.perShare)
      const taxBaseValue = parseDecimalText(draft.taxBase)

      if (shares < 1 || perShareValue <= 0) {
        const unit = row.market === 'domestic' ? '주당 원' : '주당 $'
        setFormError(`${row.ticker}의 주식수(투자 연동)와 ${unit}를 확인해 주세요.`)
        return
      }

      if (row.market === 'domestic' && taxBaseValue < 0) {
        setFormError(`${row.ticker}의 과세표준액을 확인해 주세요.`)
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
        perShareTaxBaseKrw: row.market === 'domestic' ? taxBaseValue : 0,
        referencePriceUsd: row.referencePriceUsd,
        referencePriceKrw: row.referencePriceKrw,
        recordDayOfMonth: draft.recordDayOfMonth,
      })
    }

    if (payload.length === 0) {
      setFormError('저장할 종목이 없습니다. 투자 페이지에서 종목 타입을 배당으로 지정해 주세요.')
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

  const renderRow = (row: DividendHolding, index: number) => {
    const draft = rowDrafts[row.id] ?? { perShare: '', taxBase: '', recordDayOfMonth: 1 }
    const isDomestic = row.market === 'domestic'
    const shares = row.defaultShares
    const perShare = parseDecimalText(draft.perShare)
    const taxBase = parseDecimalText(draft.taxBase)
    const domesticPreview =
      isDomestic && shares > 0 && perShare > 0
        ? calcDomesticNetFromCashAndTaxBase(shares, perShare, taxBase)
        : null

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
          <Chip
            size="small"
            label="투자연동"
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700 }}
          />
        </Stack>
        <Stack spacing={0.75}>
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
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                보유 주수
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '0.9rem' }}>
                {shares > 0 ? `${shares.toLocaleString('ko-KR')}주` : '—'}
              </Typography>
            </Stack>
          </Paper>
          <MonthlyDaySelect
            labelId={`dividend-record-day-${row.id}`}
            label="배당 기준일"
            value={draft.recordDayOfMonth}
            fullWidth
            onChange={(day) =>
              setRowDrafts((prev) => ({
                ...prev,
                [row.id]: { ...draft, recordDayOfMonth: day ?? 1 },
              }))
            }
          />
          <TextField
            label={isDomestic ? '주당 배당 (원)' : '주당 배당 (세전 $)'}
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
          {isDomestic ? (
            <TextField
              label="과세표준액 (주당 원)"
              fullWidth
              value={draft.taxBase}
              onChange={(e) =>
                setRowDrafts((prev) => ({
                  ...prev,
                  [row.id]: { ...draft, taxBase: sanitizeDecimalInput(e.target.value) },
                }))
              }
              placeholder="1"
              helperText="현금배당이 아닌 과세표준 기준 · 세금혜택 ETF"
              inputProps={{ inputMode: 'decimal' }}
              {...formDialogCompactTextFieldProps}
            />
          ) : null}
          {domesticPreview ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, lineHeight: 1.45 }}>
              세후 입금 예상 {formatKrw(domesticPreview.netKrw)}
              {taxBase > 0
                ? ` · 세금 ${formatKrw(domesticPreview.taxKrw)} (과세표준 ${formatKrw(domesticPreview.taxableKrw)})`
                : null}
            </Typography>
          ) : null}
        </Stack>
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
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>보유 배당주 수정</Typography>
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
                종목·주식수는 투자 페이지에서 타입을 배당으로 지정한 종목과 자동 연동됩니다. 여기서는 배당
                기준일·주당 배당·과세표준만 수정합니다.
              </Typography>

              {holdings.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
                  연동된 배당 종목이 없습니다. 투자 페이지(국내주식·해외주식)에서 종목 타입을 배당으로
                  지정해 주세요.
                </Typography>
              ) : null}

              {overseasHoldings.length > 0 ? (
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: 'text.secondary', mb: 0.5 }}>
                    해외 배당
                  </Typography>
                  {overseasHoldings.map((row, index) => renderRow(row, index))}
                </Box>
              ) : null}

              {domesticHoldings.length > 0 ? (
                <Box>
                  {overseasHoldings.length > 0 ? <Divider sx={{ my: 0.5 }} /> : null}
                  <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: 'success.dark', mb: 0.5 }}>
                    국내 배당
                  </Typography>
                  {domesticHoldings.map((row, index) => renderRow(row, index))}
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
        <FormDialogFooter submitLoading={submitting} submitLabel="저장" submitDisabled={holdings.length === 0} />
      </Box>
    </AppDialog>
  )
}
