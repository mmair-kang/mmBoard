'use client'
// 수정: Auto — 2026-07-21 22:00 (관리계좌 설정)

import {
  ManagedAccountsEditor,
  draftsToManagedAccounts,
  managedAccountsToDrafts,
  type ManagedAccountDraft,
} from '@/components/home/ManagedAccountsEditor'
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
import type { ManagedAccountPayload } from '@/lib/accountPayload'
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
  onSubmit: (payload: {
    managedGroupName: string
    managedAccounts: ManagedAccountPayload[]
  }) => Promise<void>
}

function validateDrafts(drafts: ManagedAccountDraft[]): boolean {
  if (drafts.length === 0) return true
  return drafts.every((row) => Boolean(row.name?.trim()))
}

export function ManagedAccountsFormDialog({ open, account, onClose, onSubmit }: Props) {
  const [groupName, setGroupName] = useState('관리계좌')
  const [drafts, setDrafts] = useState<ManagedAccountDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSubmitting(false)
      setFormError(null)
      return
    }
    setGroupName(account.managedGroupName || '관리계좌')
    setDrafts(managedAccountsToDrafts(account.managedAccounts))
  }, [open, account])

  const canSubmit = Boolean(groupName.trim()) && validateDrafts(drafts)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        managedGroupName: groupName.trim(),
        managedAccounts: draftsToManagedAccounts(drafts),
      })
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableAutoFocus slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>관리계좌 설정</Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="그룹명"
                placeholder="관리계좌"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                fullWidth
                size="small"
                margin="dense"
                sx={formDialogFirstFieldSx}
              />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>
                  계좌 목록
                </Typography>
                <ManagedAccountsEditor drafts={drafts} onChange={setDrafts} />
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
