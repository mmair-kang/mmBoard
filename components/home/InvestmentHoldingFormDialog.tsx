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
import type { InvestmentAccountId } from '@/config/investmentAccounts'
import { INVESTMENT_ACCOUNT_MAP } from '@/config/investmentAccounts'
import type { InvestmentHoldingView } from '@/hooks/useInvestments'
import type { InvestmentHoldingPayload } from '@/lib/investmentPayload'
import { normalizeInvestmentSymbol } from '@/lib/stock'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  accountId: InvestmentAccountId
  holding?: InvestmentHoldingView | null
  onClose: () => void
  onSubmit: (payload: InvestmentHoldingPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

export function InvestmentHoldingFormDialog({
  open,
  accountId,
  holding,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const meta = INVESTMENT_ACCOUNT_MAP[accountId]
  const isEdit = holding != null
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [shares, setShares] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setName('')
      setSymbol('')
      setPurchasePrice('')
      setShares('')
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (holding) {
      setName(holding.name)
      setSymbol(holding.symbol)
      setPurchasePrice(String(holding.purchasePrice))
      setShares(String(holding.shares))
    } else {
      setName('')
      setSymbol('')
      setPurchasePrice('')
      setShares('')
    }
  }, [open, holding])

  const symbolHint =
    meta.market === 'overseas'
      ? '해외 티커 (예: JEPQ)'
      : 'KRX 코드 6자리 (예: 035720, 0080X0 · KRX:0080X0 가능)'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const payload: InvestmentHoldingPayload = {
      category: accountId,
      name: name.trim(),
      symbol: normalizeInvestmentSymbol(symbol),
      market: meta.market,
      purchasePrice: Math.round(Number(purchasePrice.replace(/[^\d]/g, ''))) || 0,
      shares: Math.round(Number(shares.replace(/[^\d]/g, ''))) || 0,
    }
    if (!payload.name || !payload.symbol || payload.purchasePrice < 0 || payload.shares < 1) {
      setFormError('종목명·코드·매수가·주식수를 확인해 주세요.')
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

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    setFormError(null)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '삭제에 실패했습니다')
    } finally {
      setDeleting(false)
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
        <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {meta.label} {isEdit ? '종목 수정' : '종목 추가'}
          </Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="종목명"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="LG엔솔"
                {...formDialogCompactTextFieldProps}
              />
              <TextField
                label="종목코드"
                fullWidth
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder={meta.market === 'overseas' ? 'JEPQ' : '0080X0'}
                helperText={symbolHint}
                {...formDialogCompactTextFieldProps}
              />
              <TextField
                label="매수가 (원)"
                fullWidth
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value.replace(/[^\d]/g, ''))}
                inputProps={{ inputMode: 'numeric' }}
                {...formDialogCompactTextFieldProps}
              />
              <TextField
                label="주식수"
                fullWidth
                value={shares}
                onChange={(e) => setShares(e.target.value.replace(/[^\d]/g, ''))}
                inputProps={{ inputMode: 'numeric' }}
                {...formDialogCompactTextFieldProps}
              />
              {formError ? (
                <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter
          submitLoading={submitting}
          submitLabel={isEdit ? '저장' : '추가'}
          deleteLoading={deleting}
          onDelete={isEdit && onDelete ? () => void handleDelete() : undefined}
        />
      </Box>
    </AppDialog>
  )
}
