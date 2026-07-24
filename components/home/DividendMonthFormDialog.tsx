'use client'
// 수정: Auto — 2026-07-24 18:15 (월별 배당 입력 단순화)
// 수정: Auto — 2026-07-14 23:37

import {
  DividendEntriesEditor,
  draftToEntryPayload,
  draftsToEntries,
  entriesToDrafts,
  type DividendEntryDraft,
} from '@/components/home/DividendEntriesEditor'
import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFormSx,
  formDialogPaperSlotSx,
} from '@/config/formDialogLayout'
import type { DividendHolding, DividendMonth } from '@/hooks/useDividends'
import { entriesFromHoldings } from '@/lib/dividendPayload'
import { parseDecimalText } from '@/lib/dividendPayload'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export type DividendMonthFormPayload = {
  yearMonth: string
  entries: ReturnType<typeof draftsToEntries>
}

type Props = {
  open: boolean
  month?: DividendMonth | null
  holdings: DividendHolding[]
  usdKrwRate?: number | null
  existingYearMonths: string[]
  onClose: () => void
  onSubmit: (payload: DividendMonthFormPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

function validateDrafts(
  drafts: DividendEntryDraft[],
  holdings: DividendHolding[],
  usdKrwRate?: number | null,
): boolean {
  const marketByTicker = new Map(holdings.map((row) => [row.ticker.toUpperCase(), row.market]))
  return drafts.every((row) => {
    const entry = draftToEntryPayload(row, marketByTicker, usdKrwRate)
    const domestic =
      marketByTicker.get(entry.ticker.trim().toUpperCase()) === 'domestic' || entry.exchangeRate === 1
    const perShare = parseDecimalText(row.perShareText)
    const grossKrw = parseDecimalText(row.grossKrwText)
    if (domestic) {
      return (
        entry.dayOfMonth >= 1 &&
        entry.dayOfMonth <= 31 &&
        Boolean(entry.ticker) &&
        entry.shares > 0 &&
        grossKrw > 0
      )
    }
    return (
      entry.dayOfMonth >= 1 &&
      entry.dayOfMonth <= 31 &&
      Boolean(entry.ticker) &&
      entry.shares > 0 &&
      perShare > 0 &&
      grossKrw > 0 &&
      entry.exchangeRate > 0
    )
  })
}

export function DividendMonthFormDialog({
  open,
  month,
  holdings,
  usdKrwRate = null,
  existingYearMonths,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const isEdit = month != null
  const [yearMonth, setYearMonth] = useState('')
  const [entryDrafts, setEntryDrafts] = useState<DividendEntryDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setYearMonth('')
      setEntryDrafts([])
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }

    if (month) {
      setYearMonth(month.yearMonth)
      setEntryDrafts(entriesToDrafts(month.entries, holdings))
      return
    }

    const defaultMonth = dayjs().format('YYYY-MM')
    setYearMonth(defaultMonth)
    setEntryDrafts(entriesToDrafts(entriesFromHoldings(holdings), holdings))
  }, [open, month, holdings])

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()
    setFormError(null)
    if (!yearMonth) {
      setFormError('대상 달을 선택해 주세요.')
      return
    }
    if (!isEdit && existingYearMonths.includes(yearMonth)) {
      setFormError('이미 등록된 달입니다.')
      return
    }
    if (!validateDrafts(entryDrafts, holdings, usdKrwRate)) {
      setFormError('모든 항목의 배당 지급일·종목·보유주수·세전 배당금(원)을 확인해 주세요. (해외는 주당 $도 필요)')
      return
    }

    const entries = draftsToEntries(entryDrafts, holdings, usdKrwRate)
    if (entries.length === 0) {
      setFormError('저장할 배당 항목이 없습니다.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ yearMonth, entries })
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
      maxWidth="sm"
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
            {isEdit ? `${dayjs(`${month!.yearMonth}-01`).format('YYYY년 M월')} 배당 수정` : '배당 달 추가'}
          </Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="대상 달"
                type="month"
                size="small"
                margin="dense"
                fullWidth
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                disabled={isEdit}
                InputLabelProps={{ shrink: true }}
              />
              {!isEdit ? (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  보유 배당주가 자동으로 채워집니다. 주수·세전 배당금(원)만 달마다 입력하면 됩니다.
                </Typography>
              ) : null}
              <DividendEntriesEditor
                drafts={entryDrafts}
                holdings={holdings}
                usdKrwRate={usdKrwRate}
                onChange={setEntryDrafts}
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
          onDelete={isEdit ? () => void handleDelete() : undefined}
          deleteLoading={deleting}
          submitLoading={submitting}
          submitLabel={isEdit ? '저장' : '추가'}
          submitDisabled={submitting || deleting}
        />
      </Box>
    </AppDialog>
  )
}
