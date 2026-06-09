'use client'
// 수정: Auto — 2026-06-08

import {
  AccountOutflowsEditor,
  draftsToOutflows,
  outflowsToDrafts,
  type OutflowDraft,
} from '@/components/home/AccountOutflowsEditor'
import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFirstFieldSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { MainAccount } from '@/hooks/useAccount'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  account: MainAccount
  onClose: () => void
  onSubmit: (payload: { name: string; outflows: ReturnType<typeof draftsToOutflows> }) => Promise<void>
}

function validateOutflowDrafts(drafts: OutflowDraft[]): boolean {
  return drafts.every((row) => row.amount >= 1 && Boolean(row.title?.trim()))
}

export function AccountFormDialog({ open, account, onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [outflowDrafts, setOutflowDrafts] = useState<OutflowDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSubmitting(false)
      setFormError(null)
      return
    }
    setName(account.name)
    setOutflowDrafts(outflowsToDrafts(account.outflows))
  }, [open, account])

  const canSubmit = name.trim() && validateOutflowDrafts(outflowDrafts)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        name: name.trim(),
        outflows: draftsToOutflows(outflowDrafts),
      })
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
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>계좌 설정</Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="계좌명"
                placeholder="미래에셋"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
                margin="dense"
                sx={formDialogFirstFieldSx}
              />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>
                  출금 예정 목록
                </Typography>
                <AccountOutflowsEditor drafts={outflowDrafts} onChange={setOutflowDrafts} />
              </Box>
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
