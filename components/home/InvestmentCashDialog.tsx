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
import type { InvestmentCashPayload } from '@/lib/investmentPayload'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  accountId: InvestmentAccountId
  cashBalanceKrw: number
  onClose: () => void
  onSubmit: (payload: InvestmentCashPayload) => Promise<void>
}

export function InvestmentCashDialog({ open, accountId, cashBalanceKrw, onClose, onSubmit }: Props) {
  const meta = INVESTMENT_ACCOUNT_MAP[accountId]
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setAmount('')
      setSubmitting(false)
      setFormError(null)
      return
    }
    setAmount(String(cashBalanceKrw))
  }, [open, cashBalanceKrw])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const cashBalance = Math.round(Number(amount.replace(/[^\d]/g, ''))) || 0
    setSubmitting(true)
    try {
      await onSubmit({ category: accountId, cashBalance })
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
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>{meta.label} 예수금</Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="예수금 (원)"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
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
        <FormDialogFooter submitLoading={submitting} submitLabel="저장" />
      </Box>
    </AppDialog>
  )
}
