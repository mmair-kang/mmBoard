'use client'
// 수정: Auto — 2026-06-08

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
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

type RowDraft = {
  shares: string
  perShareUsd: string
}

type Props = {
  open: boolean
  holdings: DividendHolding[]
  onClose: () => void
  onSubmit: (holdings: DividendHoldingPayload[]) => Promise<void>
}

export function DividendHoldingsEditDialog({ open, holdings, onClose, onSubmit }: Props) {
  const [exchangeRateText, setExchangeRateText] = useState('')
  const [rowDrafts, setRowDrafts] = useState<Record<number, RowDraft>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setExchangeRateText('')
      setRowDrafts({})
      setSubmitting(false)
      setFormError(null)
      return
    }

    const rate = holdings[0]?.referenceExchangeRate ?? 0
    setExchangeRateText(rate > 0 ? decimalToText(rate) : '')

    const drafts: Record<number, RowDraft> = {}
    for (const row of holdings) {
      drafts[row.id] = {
        shares: row.defaultShares > 0 ? String(row.defaultShares) : '',
        perShareUsd: decimalToText(row.perShareDividendUsd),
      }
    }
    setRowDrafts(drafts)
  }, [open, holdings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const exchangeRate = Number(exchangeRateText.replace(/[^\d.]/g, '')) || 0
    if (exchangeRate <= 0) {
      setFormError('환율을 입력해 주세요.')
      return
    }

    const payload: DividendHoldingPayload[] = []
    for (const row of holdings) {
      const draft = rowDrafts[row.id]
      if (!draft) continue
      const shares = Math.round(Number(draft.shares.replace(/[^\d]/g, ''))) || 0
      const perShareText = draft.perShareUsd.trim()
      const perShareDividendUsd =
        !perShareText || perShareText === '.' ? 0 : Number(perShareText.replace(/[^\d.]/g, '')) || 0

      if (shares < 0 || perShareDividendUsd <= 0) {
        setFormError(`${row.ticker}의 주수와 주당$를 확인해 주세요.`)
        return
      }

      payload.push({
        id: row.id,
        ticker: row.ticker,
        defaultShares: shares,
        perShareDividendUsd,
        referencePriceUsd: row.referencePriceUsd,
        referenceExchangeRate: exchangeRate,
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
              <TextField
                label="환율 (원화 계산용)"
                fullWidth
                value={exchangeRateText}
                onChange={(e) => setExchangeRateText(sanitizeDecimalInput(e.target.value))}
                placeholder="1450"
                inputProps={{ inputMode: 'decimal' }}
                {...formDialogCompactTextFieldProps}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
                주·주당$만 입력하면 배당률과 예상 배당금이 계산됩니다.
              </Typography>

              {holdings.map((row, index) => {
                const draft = rowDrafts[row.id] ?? { shares: '', perShareUsd: '' }
                return (
                  <Box key={row.id}>
                    {index > 0 ? <Divider sx={{ my: 1 }} /> : null}
                    <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', mb: 0.75 }}>{row.ticker}</Typography>
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
                        label="주당 배당 (세전 $)"
                        fullWidth
                        value={draft.perShareUsd}
                        onChange={(e) =>
                          setRowDrafts((prev) => ({
                            ...prev,
                            [row.id]: { ...draft, perShareUsd: sanitizeDecimalInput(e.target.value) },
                          }))
                        }
                        placeholder="0.45"
                        inputProps={{ inputMode: 'decimal' }}
                        {...formDialogCompactTextFieldProps}
                      />
                    </Stack>
                  </Box>
                )
              })}

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
