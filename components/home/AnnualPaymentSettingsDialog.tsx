'use client'
// 수정: Auto — 2026-06-08

import {
  AnnualPaymentsEditor,
  draftsToPayments,
  paymentsToDrafts,
  type AnnualPaymentDraft,
} from '@/components/home/AnnualPaymentsEditor'
import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { AnnualPayment } from '@/hooks/useAnnualPayments'
import type { AnnualPaymentPayload } from '@/lib/annualPaymentPayload'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  payments: AnnualPayment[]
  onClose: () => void
  onSubmit: (payments: AnnualPaymentPayload[]) => Promise<void>
}

function validateDrafts(drafts: AnnualPaymentDraft[]): boolean {
  return drafts.every((row) => row.amount >= 1 && Boolean(row.title?.trim()))
}

export function AnnualPaymentSettingsDialog({ open, payments, onClose, onSubmit }: Props) {
  const [drafts, setDrafts] = useState<AnnualPaymentDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSubmitting(false)
      setFormError(null)
      return
    }
    setDrafts(paymentsToDrafts(payments))
  }, [open, payments])

  const canSubmit = validateDrafts(drafts)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit(draftsToPayments(drafts))
      onClose()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableAutoFocus slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>연납 설정</Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <AnnualPaymentsEditor drafts={drafts} onChange={setDrafts} />
              {formError ? (
                <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter submitLoading={submitting} submitDisabled={!canSubmit} submitLabel="저장" />
      </Box>
    </AppDialog>
  )
}
